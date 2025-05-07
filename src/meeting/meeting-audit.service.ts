import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditMeetingDto } from './dto/audit-meeting.dto';

@Injectable()
export class MeetingAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 审核会议
   * @param id 会议ID
   * @param auditDto 审核信息
   */
  async auditMeeting(id: number, auditDto: AuditMeetingDto) {
    // 确认会议存在
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException(`未找到ID为${id}的会议`);
    }

    // 只有待审核的会议才能被审核
    if (meeting.status !== 'pending') {
      throw new BadRequestException(`会议当前状态为 ${meeting.status}，只有待审核的会议才能被审核`);
    }

    // 更新会议的审核状态
    return this.prisma.meeting.update({
      where: { id },
      data: {
        status: auditDto.status,
        statusReason: auditDto.statusReason,
      },
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

  /**
   * 获取待审核的会议列表
   */
  async getPendingMeetings() {
    return this.prisma.meeting.findMany({
      where: {
        status: 'pending',
      },
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
}