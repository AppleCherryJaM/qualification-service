import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Position } from './entities/Position.entity';
import { CreatePositionDto } from './dtos/create-position.dto';

@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PositionController {
  private readonly logger = new Logger(PositionController.name);
  constructor(private readonly service: PositionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'hr')
  async create(@Body() dto: CreatePositionDto) {
    let res: Position;
    try {
      if (!dto)
        throw new Error('Error in create method in position.controller');
      res = await this.service.create(dto);
      return res;
    } catch (error) {
      this.logger.error(
        `Error in create method in PositionController: ${error}`,
      );
    }
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<Position>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
