import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private readonly prisma: PrismaService) {}
  create(createMeetingDto: CreateMeetingDto) {
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
        users: true,
        room: true,
      },
    });
  }

  findAll() {
    return this.prisma.meeting.findMany({
      include: {
        room: true,
        users: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.meeting.findUnique({
      where: { id },
      include: {
        room: true,
        users: true,
      },
    });
  }

  update(id: number, updateMeetingDto: UpdateMeetingDto) {
    const data: any = {
      name: updateMeetingDto.name,
      roomId: updateMeetingDto.roomId,
      startTime: new Date(updateMeetingDto.startTime),
      endTime: new Date(updateMeetingDto.endTime),
    };

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
        users: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.meeting.delete({
      where: { id },
    });
  }
}
