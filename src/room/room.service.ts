import { Injectable } from '@nestjs/common';
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
      },
    });
    const status = await this.calculateRoomStatus(room.id);
    return { ...room, status };
  }

  async findAll() {
    const rooms = await this.prisma.room.findMany({
      include: {
        meetings: true,
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
      },
    });
    const status = await this.calculateRoomStatus(room.id);
    return { ...room, status };
  }

  async remove(id: number) {
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async findAvailableRooms() {
    const rooms = await this.findAll();
    return rooms.filter((room) => room.status === 'available');
  }
}
