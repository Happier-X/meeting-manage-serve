import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  public readonly username: string;
  public readonly password: string;
  @IsNotEmpty()
  public readonly role: string;
}
