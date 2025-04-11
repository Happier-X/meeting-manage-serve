import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { QueryDeviceDto } from './dto/query-device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Get()
  findAll(@Query() query: QueryDeviceDto) {
    const { name, status, roomId } = query;
    const where = {};

    if (name) {
      where['name'] = { contains: name };
    }

    if (status) {
      where['status'] = status;
    }

    if (roomId) {
      where['roomId'] = roomId;
    }

    return this.deviceService.findAll({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceService.findOne(+id);
  }

  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: string) {
    return this.deviceService.findByRoomId(+roomId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceService.remove(+id);
  }

  @Post('batch-status')
  updateStatus(@Body() data: { ids: number[]; status: string }) {
    return this.deviceService.updateManyStatus(data.ids, data.status);
  }

  @Get('stats/count-by-status')
  async getStatusStats() {
    const statusCounts = await this.deviceService.countByStatus();
    return { status: statusCounts };
  }
}
