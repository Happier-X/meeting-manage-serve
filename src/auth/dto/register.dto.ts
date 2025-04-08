import { MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @MinLength(6)
  @MaxLength(16)
  public readonly username: string;

  @MinLength(8)
  @MaxLength(20)
  public readonly password: string;

  @MinLength(8)
  @MaxLength(20)
  public readonly confirmPassword: string;
}
