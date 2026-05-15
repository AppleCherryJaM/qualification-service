import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Internship } from './entities/Internship.entity';

@Controller('internships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternshipsController {
  constructor(private readonly service: InternshipsService) {}

  @Get()
  findAll(
    @Query('employeeId') empId?: string,
    @Query('mentorId') mentorId?: string,
  ) {
    return this.service.findAll({
      employeeId: empId ? parseInt(empId) : undefined,
      mentorId: mentorId ? parseInt(mentorId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'hr')
  create(@Body() dto: Partial<Internship>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<Internship>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
