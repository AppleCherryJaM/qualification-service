import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Notification } from './entities/Notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(
    @Query('employeeId') empId?: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.service.findAll({
      employeeId: empId ? parseInt(empId) : undefined,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsRead(id);
  }

  @Post()
  @Roles('admin', 'hr')
  create(@Body() dto: Partial<Notification>) {
    return this.service.create(dto);
  }
}
