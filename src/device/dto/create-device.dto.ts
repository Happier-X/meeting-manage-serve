import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsNotEmpty({ message: '设备名称不能为空' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '设备状态不能为空' })
  @IsString()
  status: string;

  @IsNotEmpty({ message: '会议室ID不能为空' })
  @IsNumber()
  roomId: number;
}
