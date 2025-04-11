import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  userIds: number[]; // 添加参会人ID数组
}
