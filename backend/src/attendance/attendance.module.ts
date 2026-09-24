import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import {
  Leave,
} from '../leaves/leave.entity';

import {
  Absence,
} from '../absences/absence.entity';

import {
  Overtime,
} from '../overtime/overtime.entity';

import {
  CalendarEvent,
} from '../calendar/entities/calendar-event.entity';

import {
  Attendance,
} from './attendance.entity';

import {
  AttendanceController,
} from './attendance.controller';

import {
  AttendanceService,
} from './attendance.service';

@Module({
  imports: [
    AuthModule,

    TypeOrmModule.forFeature([
      Attendance,
      Leave,
      Absence,
      Overtime,
      CalendarEvent,
    ]),
  ],

  controllers: [
    AttendanceController,
  ],

  providers: [
    AttendanceService,
  ],

  exports: [
    AttendanceService,
  ],
})
export class AttendanceModule {}
