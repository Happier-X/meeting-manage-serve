import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private readonly prisma: PrismaService) {}
  create(createMeetingDto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        name: createMeetingDto.name,
        roomId: createMeetingDto.roomId,
        startTime: new Date(createMeetingDto.startTime),
        endTime: new Date(createMeetingDto.endTime),
      },
    });
  }

  findAll() {
    return this.prisma.meeting.findMany({
      include: {
        room: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} meeting`;
  }

  update(id: number, updateMeetingDto: UpdateMeetingDto) {
    return this.prisma.meeting.update({
      where: { id },
      data: {
        name: updateMeetingDto.name,
        roomId: updateMeetingDto.roomId,
        startTime: new Date(updateMeetingDto.startTime),
        endTime: new Date(updateMeetingDto.endTime),
      },
    });
  }

  remove(id: number) {
    return this.prisma.meeting.delete({
      where: { id },
    });
  }
}
