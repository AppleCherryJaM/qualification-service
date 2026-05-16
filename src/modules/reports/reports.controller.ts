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
  Logger,
  Res,
} from '@nestjs/common';
import { type Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ExcelService } from './excel.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly excelService: ExcelService,
  ) {}

  @Get('employee-card/:id')
  @ApiOperation({ summary: 'Карточка сотрудника' })
  async employeeCard(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.reportsService.employeeCard(id);
    } catch (error) {
      this.logger.error(`Error in employeeCard: ${error}`);
      throw error;
    }
  }

  @Get('debtors')
  @Roles('admin', 'hr', 'manager')
  @ApiOperation({ summary: 'Список должников' })
  async debtors() {
    try {
      return await this.reportsService.debtors();
    } catch (error) {
      this.logger.error(`Error in debtors: ${error}`);
      throw error;
    }
  }

  @Get('by-department/:id')
  @Roles('admin', 'hr', 'manager')
  @ApiOperation({ summary: 'Отчёт по отделу' })
  async byDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    try {
      if (
        req.user.roles?.includes('manager') &&
        !req.user.roles?.includes('admin') &&
        !req.user.roles?.includes('hr')
      ) {
        if (req.user.employee?.departmentId !== id) {
          return { error: 'You can only view your own department' };
        }
      }
      return await this.reportsService.byDepartment(id);
    } catch (error) {
      this.logger.error(`Error in byDepartment: ${error}`);
      throw error;
    }
  }

  @Get('briefing-journal')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Журнал инструктажей' })
  async briefingJournal(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ) {
    try {
      return await this.reportsService.briefingJournal(
        new Date(start),
        new Date(end),
      );
    } catch (error) {
      this.logger.error(`Error in briefingJournal: ${error}`);
      throw error;
    }
  }

  @Get('regulatory')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Регламентный отчёт' })
  async regulatory() {
    try {
      return await this.reportsService.regulatoryReport();
    } catch (error) {
      this.logger.error(`Error in regulatory: ${error}`);
      throw error;
    }
  }

  // ========== НОВЫЕ МЕТОДЫ — EXCEL ВЫГРУЗКА ==========

  @Get('employee-card/:id/excel')
  @ApiOperation({ summary: 'Карточка сотрудника в Excel' })
  @ApiResponse({ status: 200, description: 'Excel-файл' })
  async employeeCardExcel(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const data = await this.reportsService.employeeCard(id);

      if (!data) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const headers = {
        id: 'ID',
        fullName: 'ФИО',
        tabNumber: 'Табельный номер',
        department: 'Отдел',
        position: 'Должность',
        hireDate: 'Дата приёма',
        totalCourses: 'Всего курсов',
        completedCourses: 'Пройдено',
        overdueCount: 'Просрочки',
        isBlocked: 'Заблокирован',
      };

      const row: Record<string, any> = {
        id: data.id,
        fullName: data.fullName,
        tabNumber: data.tabNumber,
        department: data.department?.name || '-',
        position: data.position?.name || '-',
        hireDate: data.hireDate
          ? new Date(data.hireDate).toLocaleDateString('ru-RU')
          : '-',
        totalCourses: data.courseAssignments?.length || 0,
        completedCourses:
          data.courseAssignments?.filter((ca: any) => ca.passed).length || 0,
        overdueCount:
          data.courseAssignments?.filter((ca: any) => ca.status === 'OVERDUE')
            .length || 0,
        isBlocked: data.isBlocked ? 'Да' : 'Нет',
      };

      const buffer = this.excelService.generateExcel(
        [row],
        'Карточка сотрудника',
        headers,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="employee_card_${id}_${Date.now()}.xlsx"`,
      );
      res.end(buffer);
    } catch (error) {
      this.logger.error(`Error in employeeCardExcel: ${error}`);
      throw error;
    }
  }

  @Get('debtors/excel')
  @Roles('admin', 'hr', 'manager')
  @ApiOperation({ summary: 'Список должников в Excel' })
  @ApiResponse({ status: 200, description: 'Excel-файл' })
  async debtorsExcel(@Res() res: Response) {
    try {
      const data = await this.reportsService.debtors();

      const headers = {
        id: 'ID',
        fullName: 'ФИО',
        tabNumber: 'Табельный номер',
        department: 'Отдел',
        overdueCount: 'Просрочки',
        totalDebt: 'Задолженность',
      };

      const buffer = this.excelService.generateExcel(data, 'Должники', headers);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="debtors_${Date.now()}.xlsx"`,
      );
      res.end(buffer);
    } catch (error) {
      this.logger.error(`Error in debtorsExcel: ${error}`);
      throw error;
    }
  }

  @Get('by-department/:id/excel')
  @Roles('admin', 'hr', 'manager')
  @ApiOperation({ summary: 'Отчёт по отделу в Excel' })
  @ApiResponse({ status: 200, description: 'Excel-файл' })
  async byDepartmentExcel(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      if (
        req.user.roles?.includes('manager') &&
        !req.user.roles?.includes('admin') &&
        !req.user.roles?.includes('hr')
      ) {
        if (req.user.employee?.departmentId !== id) {
          return res
            .status(403)
            .json({ error: 'You can only view your own department' });
        }
      }

      const data = await this.reportsService.byDepartment(id);

      const headers = {
        id: 'ID',
        fullName: 'ФИО',
        tabNumber: 'Табельный номер',
        position: 'Должность',
        totalCourses: 'Всего курсов',
        completedCourses: 'Пройдено',
        overdueCount: 'Просрочки',
      };

      const buffer = this.excelService.generateExcel(
        data,
        `Отдел_${id}`,
        headers,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="department_${id}_${Date.now()}.xlsx"`,
      );
      res.end(buffer);
    } catch (error) {
      this.logger.error(`Error in byDepartmentExcel: ${error}`);
      throw error;
    }
  }

  @Get('briefing-journal/excel')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Журнал инструктажей в Excel' })
  @ApiResponse({ status: 200, description: 'Excel-файл' })
  async briefingJournalExcel(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.reportsService.briefingJournal(
        new Date(start),
        new Date(end),
      );

      const headers = {
        id: 'ID',
        employeeName: 'Сотрудник',
        briefingType: 'Тип инструктажа',
        date: 'Дата',
        result: 'Результат',
      };

      const buffer = this.excelService.generateExcel(
        data,
        'Журнал инструктажей',
        headers,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="briefing_journal_${Date.now()}.xlsx"`,
      );
      res.end(buffer);
    } catch (error) {
      this.logger.error(`Error in briefingJournalExcel: ${error}`);
      throw error;
    }
  }

  @Get('regulatory/excel')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Регламентный отчёт в Excel' })
  @ApiResponse({ status: 200, description: 'Excel-файл' })
  async regulatoryExcel(@Res() res: Response) {
    try {
      const data = await this.reportsService.regulatoryReport();

      const headers = {
        id: 'ID',
        metric: 'Показатель',
        value: 'Значение',
        period: 'Период',
      };

      const buffer = this.excelService.generateExcel(
        data,
        'Регламентный отчёт',
        headers,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="regulatory_${Date.now()}.xlsx"`,
      );
      res.end(buffer);
    } catch (error) {
      this.logger.error(`Error in regulatoryExcel: ${error}`);
      throw error;
    }
  }
}
