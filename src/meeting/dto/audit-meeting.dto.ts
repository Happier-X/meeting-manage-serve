import { IsString, IsIn, IsOptional } from 'class-validator';

export class AuditMeetingDto {
  @IsString()
  @IsIn(['approved', 'rejected'])
  status: string;

  @IsString()
  @IsOptional()
  statusReason?: string;
}