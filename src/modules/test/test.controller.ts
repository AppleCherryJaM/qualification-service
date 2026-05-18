/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TestsService } from './test.service';
import { CreateTestDto } from './dtos/create-test.dto';
import { SubmitTestDto } from './dtos/submit-test.dto';

@ApiTags('Tests')
@ApiBearerAuth()
@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly service: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все тесты' })
  @ApiResponse({
    status: 200,
    description: 'Список тестов с вопросами и ответами',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тест по ID' })
  @ApiResponse({ status: 200, description: 'Тест найден' })
  @ApiResponse({ status: 404, description: 'Тест не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Создать тест с вопросами и ответами' })
  @ApiResponse({ status: 201, description: 'Тест создан' })
  create(@Body() dto: CreateTestDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить тест' })
  @ApiResponse({ status: 200, description: 'Тест удалён' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Сдать тест' })
  @ApiResponse({ status: 201, description: 'Результат сохранён' })
  @ApiResponse({ status: 400, description: 'Сотрудник заблокирован' })
  @ApiResponse({ status: 404, description: 'Тест или сотрудник не найден' })
  submit(
    @Param('id', ParseIntPipe) testId: number,
    @Body() dto: SubmitTestDto,
  ) {
    if (!Array.isArray(dto.answers)) {
      throw new BadRequestException('Answers must be an array');
    }
    return this.service.submit(dto.employeeId, testId, dto.answers);
  }

  @Get('results')
  @ApiOperation({ summary: 'Получить результаты тестов' })
  @ApiResponse({ status: 200, description: 'Список результатов' })
  findResults(
    @Query('employeeId') empId?: string,
    @Query('testId') testId?: string,
  ) {
    return this.service.findResults({
      employeeId: empId ? parseInt(empId) : undefined,
      testId: testId ? parseInt(testId) : undefined,
    });
  }

  @Get('results/all')
  @ApiOperation({ summary: 'Все результаты тестов' })
  findAllResults() {
    return this.service.findResults({});
  }
}
