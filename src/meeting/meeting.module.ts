import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MeetingAuditService } from './meeting-audit.service';
import { MeetingAuditController } from './meeting-audit.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MeetingController, MeetingAuditController],
  providers: [MeetingService, MeetingAuditService, PrismaService],
})
export class MeetingModule {}
