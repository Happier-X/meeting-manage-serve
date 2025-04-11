import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MeetingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMeetingDto: CreateMeetingDto) {
    // 检查会议室在指定时间是否可用
    const conflictingMeeting = await this.prisma.meeting.findFirst({
      where: {
        roomId: createMeetingDto.roomId,
        OR: [
          {
            // 新会议开始时间在已有会议时间范围内
            startTime: {
              gte: new Date(createMeetingDto.startTime),
              lte: new Date(createMeetingDto.endTime),
            },
          },
          {
            // 新会议结束时间在已有会议时间范围内
            endTime: {
              gte: new Date(createMeetingDto.startTime),
              lte: new Date(createMeetingDto.endTime),
            },
          },
          {
            // 已有会议在新会议时间范围内
            AND: [
              { startTime: { lte: new Date(createMeetingDto.startTime) } },
              { endTime: { gte: new Date(createMeetingDto.endTime) } },
            ],
          },
        ],
      },
    });

    if (conflictingMeeting) {
      throw new BadRequestException('会议室在指定时间已被预订');
    }

    const data: any = {
      name: createMeetingDto.name,
      roomId: createMeetingDto.roomId,
      startTime: new Date(createMeetingDto.startTime),
      endTime: new Date(createMeetingDto.endTime),
    };

    if (createMeetingDto.userIds && createMeetingDto.userIds.length > 0) {
      data.users = {
        create: createMeetingDto.userIds.map((userId) => ({
          userId: userId,
        })),
      };
    }

    return this.prisma.meeting.create({
      data,
      include: {
        users: {
          include: {
            user: true,
          },
        },
        room: true,
      },
    });
  }

  async findAll(query?: {
    startDate?: string;
    endDate?: string;
    roomId?: number;
    userId?: number;
    name?: string;
  }) {
    const where: Prisma.MeetingWhereInput = {};

    // 按会议名称筛选
    if (query?.name) {
      where.name = { contains: query.name };
    }

    // 按时间范围筛选
    if (query?.startDate || query?.endDate) {
      if (query.startDate) {
        where.startTime = { gte: new Date(query.startDate) };
      }

      if (query.endDate) {
        where.endTime = { lte: new Date(query.endDate) };
      }
    }

    // 按会议室筛选
    if (query?.roomId) {
      where.roomId = Number(query.roomId);
    }

    // 按参与用户筛选
    if (query?.userId) {
      where.users = {
        some: {
          userId: Number(query.userId),
        },
      };
    }

    return this.prisma.meeting.findMany({
      where,
      include: {
        room: true,
        users: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        room: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException(`未找到ID为${id}的会议`);
    }

    return meeting;
  }

  async update(id: number, updateMeetingDto: UpdateMeetingDto) {
    // 确认会议存在
    const existingMeeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!existingMeeting) {
      throw new NotFoundException(`未找到ID为${id}的会议`);
    }

    // 如果更改了会议室或时间，检查会议室在新时间是否可用
    if (
      (updateMeetingDto.roomId &&
        updateMeetingDto.roomId !== existingMeeting.roomId) ||
      (updateMeetingDto.startTime &&
        new Date(updateMeetingDto.startTime).toString() !==
          existingMeeting.startTime.toString()) ||
      (updateMeetingDto.endTime &&
        new Date(updateMeetingDto.endTime).toString() !==
          existingMeeting.endTime.toString())
    ) {
      const roomId = updateMeetingDto.roomId || existingMeeting.roomId;
      const startTime = updateMeetingDto.startTime
        ? new Date(updateMeetingDto.startTime)
        : existingMeeting.startTime;
      const endTime = updateMeetingDto.endTime
        ? new Date(updateMeetingDto.endTime)
        : existingMeeting.endTime;

      const conflictingMeeting = await this.prisma.meeting.findFirst({
        where: {
          id: { not: id },
          roomId: roomId,
          OR: [
            {
              startTime: {
                gte: startTime,
                lte: endTime,
              },
            },
            {
              endTime: {
                gte: startTime,
                lte: endTime,
              },
            },
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingMeeting) {
        throw new BadRequestException('会议室在指定时间已被预订');
      }
    }

    const data: any = {};

    if (updateMeetingDto.name) data.name = updateMeetingDto.name;
    if (updateMeetingDto.roomId) data.roomId = updateMeetingDto.roomId;
    if (updateMeetingDto.startTime)
      data.startTime = new Date(updateMeetingDto.startTime);
    if (updateMeetingDto.endTime)
      data.endTime = new Date(updateMeetingDto.endTime);

    if (updateMeetingDto.userIds) {
      data.users = {
        deleteMany: {},
        create: updateMeetingDto.userIds.map((userId) => ({
          userId: userId,
        })),
      };
    }

    return this.prisma.meeting.update({
      where: { id },
      data,
      include: {
        room: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // 确认会议存在
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException(`未找到ID为${id}的会议`);
    }

    // 先删除会议参与者关联记录
    await this.prisma.meetingParticipant.deleteMany({
      where: { meetingId: id },
    });

    // 然后删除会议
    return this.prisma.meeting.delete({
      where: { id },
    });
  }

  // 获取特定会议室的可用时间
  async getRoomAvailability(
    roomId: number,
    startDate: string,
    endDate: string,
  ) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`未找到ID为${roomId}的会议室`);
    }

    const meetings = await this.prisma.meeting.findMany({
      where: {
        roomId,
        AND: [
          { startTime: { gte: new Date(startDate) } },
          { endTime: { lte: new Date(endDate) } },
        ],
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      room,
      meetings,
    };
  }

  async getStatistics(startDate?: string, endDate?: string) {
    // 如果没有提供日期范围，默认取最近7天
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // 查询指定日期范围内的会议
    const meetings = await this.prisma.meeting.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      select: {
        startTime: true,
      },
    });

    // 创建日期映射，用于统计每天的会议数量
    const dateCountMap = new Map<string, number>();

    // 初始化日期范围内的所有日期计数为0
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]; // 格式: YYYY-MM-DD
      dateCountMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 统计每天的会议数量
    meetings.forEach((meeting) => {
      const dateStr = meeting.startTime.toISOString().split('T')[0];
      const count = dateCountMap.get(dateStr) || 0;
      dateCountMap.set(dateStr, count + 1);
    });

    // 将Map转换为排序后的日期和计数数组
    const dates: string[] = [];
    const counts: number[] = [];

    // 按日期排序
    Array.from(dateCountMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .forEach(([date, count]) => {
        dates.push(date);
        counts.push(count);
      });

    return {
      dates,
      counts,
    };
  }
}
