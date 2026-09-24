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
  ) {}

  @Post()
  create(
    @Body()
    createAttendanceDto: CreateAttendanceDto,
  ) {
    return this.attendanceService.create(
      createAttendanceDto,
    );
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
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(
      id,
      updateAttendanceDto,
    );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.attendanceService.remove(
      id,
    );
  }
}
