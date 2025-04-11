import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    return await this.prisma.device.create({
      data: createDeviceDto,
      include: {
        room: true, // 包含会议室信息
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DeviceWhereUniqueInput;
    where?: Prisma.DeviceWhereInput;
    orderBy?: Prisma.DeviceOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params || {};

    return await this.prisma.device.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        room: true, // 包含会议室信息
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.device.findUnique({
      where: { id },
      include: {
        room: true, // 包含会议室信息
      },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return await this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
      include: {
        room: true, // 包含会议室信息
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.device.delete({
      where: { id },
      include: {
        room: true, // 包含会议室信息
      },
    });
  }

  // 根据会议室ID查询设备
  async findByRoomId(roomId: number) {
    return await this.prisma.device.findMany({
      where: { roomId },
      include: {
        room: true,
      },
    });
  }

  // 批量更新设备状态
  async updateManyStatus(ids: number[], status: string) {
    return await this.prisma.device.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status,
      },
    });
  }

  // 统计设备状态
  async countByStatus() {
    // 获取所有设备
    const devices = await this.prisma.device.findMany();

    // 初始化计数对象
    const statusCount = {
      normal: 0,
      fault: 0,
    };

    // 统计不同状态的设备数量
    devices.forEach((device) => {
      if (device.status === 'normal') {
        statusCount.normal++;
      } else if (device.status === 'fault') {
        statusCount.fault++;
      }
    });

    return statusCount;
  }
}
