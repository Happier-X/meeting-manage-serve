import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @IsInt()
  @IsNotEmpty()
  meetingId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNotEmpty()
  recorderId: number;

  @IsString()
  @IsOptional()
  attachments?: string;
}
