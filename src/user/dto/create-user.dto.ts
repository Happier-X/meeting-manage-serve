import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  public readonly username: string;
  @IsNotEmpty()
  public readonly password: string;
  @IsNotEmpty()
  public readonly role: string;
}
