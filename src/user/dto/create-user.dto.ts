import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名最少需要3个字符' })
  @MaxLength(20, { message: '用户名最多不超过20个字符' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码最少需要6个字符' })
  password: string;

  @IsOptional()
  @IsString({ message: '角色必须是字符串' })
  role?: string;
}
