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
import { BriefingsService } from './briefings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Briefing } from './entities/Briefing.entity';

@Controller('briefings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BriefingsController {
  constructor(private readonly service: BriefingsService) {}

  @Get()
  findAll(
    @Query('employeeId') empId?: string,
    @Query('instructorId') instId?: string,
    @Query('type') type?: string,
  ) {
    return this.service.findAll({
      employeeId: empId ? parseInt(empId) : undefined,
      instructorId: instId ? parseInt(instId) : undefined,
      type,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'hr', 'instructor')
  create(@Body() dto: Partial<Briefing>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<Briefing>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
