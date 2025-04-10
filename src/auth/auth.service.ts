import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerObj: RegisterDto) {
    const { username } = registerObj;
    const password = await argon2.hash(registerObj.password);
    return this.prisma.user.create({
      data: {
        username,
        password,
      },
    });
  }

  async validate(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (!user) {
      return null;
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  generateJwt(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        name: user.username,
        id: user.id,
        role: user.role,
      },
    };
  }
}
