import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}

  private async calculateRoomStatus(roomId: number): Promise<string> {
    const now = new Date();
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        roomId: roomId,
        startTime: { lte: now },
        endTime: { gte: now },
      },
    });
    return meeting ? 'occupied' : 'available';
  }

  async create(createRoomDto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        capacity: createRoomDto.capacity,
        location: createRoomDto.location,
        status: 'available',
      },
    });
    const status = await this.calculateRoomStatus(room.id);
    return { ...room, status };
  }

  async findAll() {
    const rooms = await this.prisma.room.findMany({
      include: {
        meetings: true,
        devices: true,
      },
    });

    return Promise.all(
      rooms.map(async (room) => {
        const status = await this.calculateRoomStatus(room.id);
        return { ...room, status };
      }),
    );
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        meetings: true,
        devices: true,
      },
    });
    if (!room) return null;
    const status = await this.calculateRoomStatus(room.id);
    return { ...room, status };
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const room = await this.prisma.room.update({
      where: { id },
      data: {
        name: updateRoomDto.name,
        capacity: updateRoomDto.capacity,
        location: updateRoomDto.location,
        ...(updateRoomDto.status && { status: updateRoomDto.status }),
      },
    });
    const status = await this.calculateRoomStatus(room.id);
    return { ...room, status };
  }

  async remove(id: number) {
    try {
      // 开始事务，确保操作的原子性
      return await this.prisma.$transaction(async (prisma) => {
        // 1. 删除与会议室关联的所有会议的参与者记录
        await prisma.meetingParticipant.deleteMany({
          where: {
            meeting: {
              roomId: id,
            },
          },
        });

        // 2. 删除与会议室关联的所有会议
        await prisma.meeting.deleteMany({
          where: { roomId: id },
        });

        // 3. 删除与会议室关联的所有设备
        await prisma.device.deleteMany({
          where: { roomId: id },
        });

        // 4. 最后删除会议室本身
        return prisma.room.delete({
          where: { id },
        });
      });
    } catch (error) {
      throw new HttpException(
        `删除会议室失败: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAvailableRooms() {
    const rooms = await this.findAll();
    return rooms.filter((room) => room.status === 'available');
  }

  async setRoomMaintenance(id: number, inMaintenance: boolean) {
    return this.prisma.room.update({
      where: { id },
      data: {
        status: inMaintenance ? 'maintenance' : 'available',
      },
    });
  }

  async searchRooms(keyword: string, minCapacity?: number) {
    const rooms = await this.prisma.room.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { location: { contains: keyword } },
        ],
        ...(minCapacity && { capacity: { gte: minCapacity } }),
      },
      include: {
        meetings: true,
        devices: true,
      },
    });

    return Promise.all(
      rooms.map(async (room) => {
        const status = await this.calculateRoomStatus(room.id);
        return { ...room, status };
      }),
    );
  }

  async getRoomUsage() {
    // 获取所有会议室
    const rooms = await this.findAll();

    // 计算已使用和空闲的会议室数量
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (room) => room.status === 'occupied' || room.status === 'maintenance',
    ).length;
    const availableRooms = totalRooms - occupiedRooms;

    // 计算百分比，如果没有会议室则都为0
    const usedPercentage =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const freePercentage =
      totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0;

    return {
      overallUsage: {
        used: usedPercentage,
        free: freePercentage,
      },
    };
  }
}
