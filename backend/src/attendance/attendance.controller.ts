import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

import {
  AttendanceService,
} from './attendance.service';

import {
  CreateAttendanceDto,
} from './dto/create-attendance.dto';

import {
  UpdateAttendanceDto,
} from './dto/update-attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(
    @Body()
    createAttendanceDto: CreateAttendanceDto,
  ) {
    const attendance =
      await this.attendanceService.create(
        createAttendanceDto,
      );

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'ATTENDANCE',
      recordId: attendance.id,
      description: `Created attendance record for employee ${attendance.employeeId}`,
      newData: attendance,
    });

    return attendance;
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param(
      'employeeId',
      ParseIntPipe,
    )
    employeeId: number,
  ) {
    return this.attendanceService.findByEmployee(
      employeeId,
    );
  }

  @Get(
    'employee/:employeeId/calendar',
  )
  getEmployeeCalendar(
    @Param(
      'employeeId',
      ParseIntPipe,
    )
    employeeId: number,

    @Query('year')
    year: string,

    @Query('month')
    month: string,
  ) {
    return this.attendanceService.getEmployeeCalendar(
      employeeId,
      Number(year),
      Number(month),
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.attendanceService.findOne(
      id,
    );
  }

  @Patch(':id')
  async update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const attendance =
      await this.attendanceService.update(
        id,
        updateAttendanceDto,
      );

    await this.auditLogsService.create({
      action: 'UPDATE',
      module: 'ATTENDANCE',
      recordId: id,
      description: `Updated attendance record`,
      newData: attendance,
    });

    return attendance;
  }

  @Delete(':id')
  async remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const result =
      await this.attendanceService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'ATTENDANCE',
      recordId: id,
      description: `Deleted attendance record`,
    });

    return result;
  }
}
