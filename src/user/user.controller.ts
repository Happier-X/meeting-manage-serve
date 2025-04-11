import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: '用户创建成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  @Get()
  async findAll(@Query() query: QueryUserDto) {
    const { skip, take, username, role, sortBy, sortOrder } = query;

    const where = {};
    if (username) {
      where['username'] = { contains: username };
    }
    if (role) {
      where['role'] = role;
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    const [users, total] = await Promise.all([
      this.userService.findAll({
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
        where,
        orderBy,
      }),
      this.userService.countUsers(where),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        pageSize: take || 10,
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get(':id/meetings')
  getUserMeetings(@Param('id') id: string) {
    return this.userService.getUserMeetings(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
