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
import { CourseAssignmentsService } from './course-assignments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CourseAssignment } from './entities/CourseAssignment.entity';
import { TasksService } from '../tasks/tasks.service';

@Controller('course-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseAssignmentsController {
  constructor(
    private readonly service: CourseAssignmentsService,
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  findAll(
    @Query('employeeId') empId?: string,
    @Query('status') status?: string,
    @Query('overdue') overdue?: string,
  ) {
    return this.service.findAll({
      employeeId: empId ? parseInt(empId) : undefined,
      status,
      overdue: overdue === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'hr', 'manager')
  create(@Body() dto: Partial<CourseAssignment>) {
    return this.service.create(dto);
  }

  @Post('assign')
  @Roles('admin', 'hr', 'manager')
  assign(
    @Body() dto: { employeeId: number; courseId: number; plannedDate: string },
  ) {
    return this.service.assign(
      dto.employeeId,
      dto.courseId,
      new Date(dto.plannedDate),
    );
  }

  @Post(':id/complete')
  @Roles('admin', 'hr')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { factDate: string; passed: boolean; filePath?: string },
  ) {
    return this.service.complete(
      id,
      new Date(dto.factDate),
      dto.passed,
      dto.filePath,
    );
  }

  @Patch(':id')
  @Roles('admin', 'hr', 'manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CourseAssignment>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('check-overdue')
  @Roles('admin', 'hr')
  checkOverdue() {
    return this.tasksService.runManualCheck();
  }
}
