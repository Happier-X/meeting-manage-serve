import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordService {
  constructor(private prisma: PrismaService) {}

  async create(createRecordDto: CreateRecordDto, user?: any) {
    // 检查会议是否存在
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: createRecordDto.meetingId },
    });

    if (!meeting) {
      throw new NotFoundException(`会议ID ${createRecordDto.meetingId} 不存在`);
    }

    // 从用户token中获取recorderId，如果user不存在则使用默认值
    const recorderId = user?.id || createRecordDto.recorderId || null;

    // 提取Prisma模型支持的字段
    const { meetingId, content, attachments } = createRecordDto;

    // 创建会议记录，添加recorderId，仅使用模型支持的字段
    return this.prisma.meetingRecord.create({
      data: {
        content,
        attachments,
        recorderId,
        meeting: {
          connect: {
            id: meetingId,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.meetingRecord.findMany({
      include: {
        meeting: true,
      },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.meetingRecord.findUnique({
      where: { id },
      include: {
        meeting: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`会议记录ID ${id} 不存在`);
    }

    return record;
  }

  async update(id: number, updateRecordDto: UpdateRecordDto) {
    // 检查记录是否存在
    const recordExists = await this.prisma.meetingRecord.findUnique({
      where: { id },
    });

    if (!recordExists) {
      throw new NotFoundException(`会议记录ID ${id} 不存在`);
    }

    return this.prisma.meetingRecord.update({
      where: { id },
      data: updateRecordDto,
    });
  }

  async remove(id: number) {
    // 检查记录是否存在
    const recordExists = await this.prisma.meetingRecord.findUnique({
      where: { id },
    });

    if (!recordExists) {
      throw new NotFoundException(`会议记录ID ${id} 不存在`);
    }

    return this.prisma.meetingRecord.delete({
      where: { id },
    });
  }
}
