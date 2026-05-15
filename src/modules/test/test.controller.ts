/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TestsService } from './test.service';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly service: TestsService) {}

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
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/submit')
  submit(
    @Param('id', ParseIntPipe) testId: number,
    @Body()
    dto: {
      employeeId: number;
      answers: { questionId: number; answerId: number }[];
    },
  ) {
    return this.service.submit(dto.employeeId, testId, dto.answers);
  }

  @Get('results')
  findResults(
    @Query('employeeId') empId?: string,
    @Query('testId') testId?: string,
  ) {
    return this.service.findResults({
      employeeId: empId ? parseInt(empId) : undefined,
      testId: testId ? parseInt(testId) : undefined,
    });
  }
}
