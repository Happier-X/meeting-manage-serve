import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordDto } from './create-record.dto';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  attachments?: string;

  @IsInt()
  @IsOptional()
  recorderId?: number;
}
