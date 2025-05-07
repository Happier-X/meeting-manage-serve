import { Controller, Get, Post, Body, Param, UnauthorizedException } from '@nestjs/common';
import { MeetingAuditService } from './meeting-audit.service';
import { AuditMeetingDto } from './dto/audit-meeting.dto';

@Controller('meeting-audit')
export class MeetingAuditController {
  constructor(private readonly meetingAuditService: MeetingAuditService) {}

  /**
   * 审核会议
   * @param id 会议ID
   * @param auditDto 审核信息
   */
  @Post(':id')
  auditMeeting(@Param('id') id: string, @Body() auditDto: AuditMeetingDto) {
    return this.meetingAuditService.auditMeeting(+id, auditDto);
  }

  /**
   * 获取待审核的会议列表
   */
  @Get('pending')
  getPendingMeetings() {
    return this.meetingAuditService.getPendingMeetings();
  }
}