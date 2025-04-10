import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  // @IsNotEmpty()
  status: string;
}
