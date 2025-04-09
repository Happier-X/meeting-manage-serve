import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private readonly prisma: PrismaService) {}
  create(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        capacity: createRoomDto.capacity,
        location: createRoomDto.location,
        status: createRoomDto.status,
      },
    });
  }

  findAll() {
    return this.prisma.room.findMany({});
  }

  // findOne(id: number) {
  //   return this.prisma.room.findUnique({
  //     where: { id },
  //   });
  // }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id },
      data: {
        name: updateRoomDto.name,
        capacity: updateRoomDto.capacity,
        location: updateRoomDto.location,
        status: updateRoomDto.status,
      },
    });
  }

  remove(id: number) {
    return this.prisma.room.delete({
      where: { id },
    });
  }

  findAvailableRooms() {
    return this.prisma.room.findMany({
      where: {
        status: 'available',
      },
    });
  }
}
