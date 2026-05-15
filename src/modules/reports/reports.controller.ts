/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('employee-card/:id')
  employeeCard(@Param('id', ParseIntPipe) id: number) {
    return this.service.employeeCard(id);
  }

  @Get('debtors')
  @Roles('admin', 'hr', 'manager')
  debtors() {
    return this.service.debtors();
  }

  @Get('by-department/:id')
  @Roles('admin', 'hr', 'manager')
  async byDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    if (
      req.user.roles?.includes('manager') &&
      !req.user.roles?.includes('admin') &&
      !req.user.roles?.includes('hr')
    ) {
      if (req.user.employee?.departmentId !== id) {
        return { error: 'You can only view your own department' };
      }
    }
    return this.service.byDepartment(id);
  }

  @Get('briefing-journal')
  @Roles('admin', 'hr')
  briefingJournal(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ) {
    return this.service.briefingJournal(new Date(start), new Date(end));
  }

  @Get('regulatory')
  @Roles('admin', 'hr')
  regulatory() {
    return this.service.regulatoryReport();
  }
}
