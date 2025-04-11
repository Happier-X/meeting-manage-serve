import { PartialType } from '@nestjs/mapped-types';
import { CreateMeetingDto } from './create-meeting.dto';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  roomId?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  userIds?: number[];
}
