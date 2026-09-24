import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Attendance,
} from './attendance.entity';

import {
  CreateAttendanceDto,
} from './dto/create-attendance.dto';

import {
  UpdateAttendanceDto,
} from './dto/update-attendance.dto';

import {
  Leave,
  LeaveStatus,
} from '../leaves/leave.entity';

import {
  Absence,
} from '../absences/absence.entity';

import {
  Overtime,
} from '../overtime/overtime.entity';

import {
  CalendarEvent,
  CalendarEventType,
} from '../calendar/entities/calendar-event.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,

    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,

    @InjectRepository(Overtime)
    private readonly overtimeRepository: Repository<Overtime>,

    @InjectRepository(CalendarEvent)
    private readonly calendarRepository: Repository<CalendarEvent>,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
  ) {
    const existing =
      await this.attendanceRepository.findOne({
        where: {
          employeeId:
            createAttendanceDto.employeeId,

          date:
            createAttendanceDto.date,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Attendance already exists for this employee on this date',
      );
    }

    const attendance =
      this.attendanceRepository.create({
        ...createAttendanceDto,

        clockIn:
          createAttendanceDto.clockIn ||
          null,

        clockOut:
          createAttendanceDto.clockOut ||
          null,

        hoursWorked:
          createAttendanceDto.hoursWorked ??
          null,

        notes:
          createAttendanceDto.notes?.trim() ||
          null,
      });

    return this.attendanceRepository.save(
      attendance,
    );
  }

  async findAll() {
    return this.attendanceRepository.find({
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const attendance =
      await this.attendanceRepository.findOne({
        where: { id },
      });

    if (!attendance) {
      throw new NotFoundException(
        'Attendance record not found',
      );
    }

    return attendance;
  }

  async findByEmployee(
    employeeId: number,
  ) {
    return this.attendanceRepository.find({
      where: {
        employeeId,
      },

      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const attendance =
      await this.findOne(id);

    const employeeId =
      updateAttendanceDto.employeeId ??
      attendance.employeeId;

    const date =
      updateAttendanceDto.date ??
      attendance.date;

    const existing =
      await this.attendanceRepository.findOne({
        where: {
          employeeId,
          date,
        },
      });

    if (
      existing &&
      existing.id !== id
    ) {
      throw new BadRequestException(
        'Attendance already exists for this employee on this date',
      );
    }

    Object.assign(
      attendance,
      updateAttendanceDto,
    );

    if (
      updateAttendanceDto.notes !==
      undefined
    ) {
      attendance.notes =
        updateAttendanceDto.notes?.trim() ||
        null;
    }

    return this.attendanceRepository.save(
      attendance,
    );
  }

  async remove(id: number) {
    const attendance =
      await this.findOne(id);

    await this.attendanceRepository.remove(
      attendance,
    );

    return {
      message:
        'Attendance record deleted successfully',
    };
  }

  async getEmployeeCalendar(
    employeeId: number,
    year: number,
    month: number,
  ) {
    const startDate =
      `${year}-${String(month).padStart(2, '0')}-01`;

    const lastDay =
      new Date(
        year,
        month,
        0,
      ).getDate();

    const endDate =
      `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const [
      attendance,
      leaves,
      absences,
      overtime,
      calendarEvents,
    ] = await Promise.all([
      this.attendanceRepository
        .createQueryBuilder('attendance')
        .where(
          'attendance.employeeId = :employeeId',
          { employeeId },
        )
        .andWhere(
          'attendance.date BETWEEN :startDate AND :endDate',
          {
            startDate,
            endDate,
          },
        )
        .orderBy(
          'attendance.date',
          'ASC',
        )
        .getMany(),

      this.leaveRepository
        .createQueryBuilder('leave')
        .where(
          'leave.employeeId = :employeeId',
          { employeeId },
        )
        .andWhere(
          'leave.startDate <= :endDate',
          { endDate },
        )
        .andWhere(
          'leave.endDate >= :startDate',
          { startDate },
        )
        .andWhere(
          'leave.status != :cancelled',
          {
            cancelled:
              LeaveStatus.CANCELLED,
          },
        )
        .getMany(),

      this.absenceRepository
        .createQueryBuilder('absence')
        .where(
          'absence.employeeId = :employeeId',
          { employeeId },
        )
        .andWhere(
          'absence.date BETWEEN :startDate AND :endDate',
          {
            startDate,
            endDate,
          },
        )
        .getMany(),

      this.overtimeRepository
        .createQueryBuilder('overtime')
        .where(
          'overtime.employeeId = :employeeId',
          { employeeId },
        )
        .andWhere(
          'overtime.date BETWEEN :startDate AND :endDate',
          {
            startDate,
            endDate,
          },
        )
        .getMany(),

      this.calendarRepository
        .createQueryBuilder('calendar')
        .where(
          'calendar.date BETWEEN :startDate AND :endDate',
          {
            startDate,
            endDate,
          },
        )
        .getMany(),
    ]);

    return {
      employeeId,
      year,
      month,
      attendance,
      leaves,
      absences,
      overtime,
      calendarEvents,
    };
  }
}
