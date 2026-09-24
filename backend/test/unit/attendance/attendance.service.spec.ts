import { jest } from '@jest/globals';

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AttendanceService } from '../../../src/attendance/attendance.service';
import {
  Attendance,
  AttendanceStatus,
} from '../../../src/attendance/attendance.entity';

import {
  Leave,
  LeaveStatus,
  LeaveType,
} from '../../../src/leaves/leave.entity';

import {
  Absence,
  AbsenceStatus,
} from '../../../src/absences/absence.entity';

import {
  Overtime,
  OvertimeStatus,
} from '../../../src/overtime/overtime.entity';

import {
  CalendarEvent,
  CalendarEventType,
} from '../../../src/calendar/entities/calendar-event.entity';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const attendanceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const leaveRepository = {
    createQueryBuilder: jest.fn(),
  };

  const absenceRepository = {
    createQueryBuilder: jest.fn(),
  };

  const overtimeRepository = {
    createQueryBuilder: jest.fn(),
  };

  const calendarRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AttendanceService(
      attendanceRepository as any,
      leaveRepository as any,
      absenceRepository as any,
      overtimeRepository as any,
      calendarRepository as any,
    );
  });

  describe('create', () => {
    it('should create attendance successfully', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        clockIn: '08:00',
        clockOut: '17:00',
        hoursWorked: 8,
        status: AttendanceStatus.PRESENT,
        notes: 'Regular work day',
      };

      const attendance = {
        id: 1,
        ...dto,
      };

      attendanceRepository.findOne.mockResolvedValue(
        null,
      );

      attendanceRepository.create.mockReturnValue(
        attendance,
      );

      attendanceRepository.save.mockResolvedValue(
        attendance,
      );

      const result = await service.create(dto);

      expect(
        attendanceRepository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
          date: '2026-09-24',
        },
      });

      expect(
        attendanceRepository.create,
      ).toHaveBeenCalledWith({
        ...dto,
        clockIn: '08:00',
        clockOut: '17:00',
        hoursWorked: 8,
        notes: 'Regular work day',
      });

      expect(
        attendanceRepository.save,
      ).toHaveBeenCalledWith(
        attendance,
      );

      expect(result).toEqual(attendance);
    });

    it('should reject duplicate attendance', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        status: AttendanceStatus.PRESENT,
      };

      attendanceRepository.findOne.mockResolvedValue({
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      });

      await expect(
        service.create(dto),
      ).rejects.toThrow(
        new BadRequestException(
          'Attendance already exists for this employee on this date',
        ),
      );

      expect(
        attendanceRepository.create,
      ).not.toHaveBeenCalled();

      expect(
        attendanceRepository.save,
      ).not.toHaveBeenCalled();
    });

    it('should convert missing optional values to null', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        status: AttendanceStatus.ABSENT,
      };

      const attendance = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        clockIn: null,
        clockOut: null,
        hoursWorked: null,
        status: AttendanceStatus.ABSENT,
        notes: null,
      };

      attendanceRepository.findOne.mockResolvedValue(
        null,
      );

      attendanceRepository.create.mockReturnValue(
        attendance,
      );

      attendanceRepository.save.mockResolvedValue(
        attendance,
      );

      const result = await service.create(dto);

      expect(
        attendanceRepository.create,
      ).toHaveBeenCalledWith({
        employeeId: 1,
        date: '2026-09-24',
        status: AttendanceStatus.ABSENT,
        clockIn: null,
        clockOut: null,
        hoursWorked: null,
        notes: null,
      });

      expect(result).toEqual(attendance);
    });
  });

  describe('findAll', () => {
    it('should return all attendance records', async () => {
      const records = [
        {
          id: 1,
          employeeId: 1,
          date: '2026-09-24',
        },
        {
          id: 2,
          employeeId: 2,
          date: '2026-09-23',
        },
      ];

      attendanceRepository.find.mockResolvedValue(
        records,
      );

      const result = await service.findAll();

      expect(
        attendanceRepository.find,
      ).toHaveBeenCalledWith({
        order: {
          date: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(records);
    });
  });

  describe('findOne', () => {
    it('should return an attendance record', async () => {
      const record = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      };

      attendanceRepository.findOne.mockResolvedValue(
        record,
      );

      const result = await service.findOne(1);

      expect(
        attendanceRepository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(record);
    });

    it('should throw when attendance does not exist', async () => {
      attendanceRepository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(999),
      ).rejects.toThrow(
        new NotFoundException(
          'Attendance record not found',
        ),
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return attendance records for an employee', async () => {
      const records = [
        {
          id: 1,
          employeeId: 10,
          date: '2026-09-24',
        },
        {
          id: 2,
          employeeId: 10,
          date: '2026-09-23',
        },
      ];

      attendanceRepository.find.mockResolvedValue(
        records,
      );

      const result =
        await service.findByEmployee(10);

      expect(
        attendanceRepository.find,
      ).toHaveBeenCalledWith({
        where: {
          employeeId: 10,
        },
        order: {
          date: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(records);
    });
  });

  describe('update', () => {
    it('should update attendance successfully', async () => {
      const attendance = {
        id: 1,
        employeeId: 10,
        date: '2026-09-24',
        clockIn: '08:00',
        clockOut: '17:00',
        hoursWorked: 8,
        status: AttendanceStatus.PRESENT,
        notes: null,
      };

      const dto = {
        clockIn: '08:15',
        status: AttendanceStatus.LATE,
        notes: 'Traffic',
      };

      attendanceRepository.findOne
        .mockResolvedValueOnce(attendance)
        .mockResolvedValueOnce(null);

      attendanceRepository.save.mockResolvedValue({
        ...attendance,
        ...dto,
      });

      const result =
        await service.update(1, dto);

      expect(
        attendanceRepository.findOne,
      ).toHaveBeenNthCalledWith(1, {
        where: {
          id: 1,
        },
      });

      expect(
        attendanceRepository.findOne,
      ).toHaveBeenNthCalledWith(2, {
        where: {
          employeeId: 10,
          date: '2026-09-24',
        },
      });

      expect(attendance.clockIn).toBe(
        '08:15',
      );

      expect(attendance.status).toBe(
        AttendanceStatus.LATE,
      );

      expect(attendance.notes).toBe(
        'Traffic',
      );

      expect(
        attendanceRepository.save,
      ).toHaveBeenCalledWith(
        attendance,
      );

      expect(result).toEqual({
        ...attendance,
        ...dto,
      });
    });

    it('should reject duplicate employee and date during update', async () => {
      const attendance = {
        id: 1,
        employeeId: 10,
        date: '2026-09-24',
        status: AttendanceStatus.PRESENT,
      };

      const duplicate = {
        id: 2,
        employeeId: 20,
        date: '2026-09-25',
      };

      attendanceRepository.findOne
        .mockResolvedValueOnce(attendance)
        .mockResolvedValueOnce(duplicate);

      await expect(
        service.update(1, {
          employeeId: 20,
          date: '2026-09-25',
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Attendance already exists for this employee on this date',
        ),
      );

      expect(
        attendanceRepository.save,
      ).not.toHaveBeenCalled();
    });

    it('should convert blank notes to null', async () => {
      const attendance = {
        id: 1,
        employeeId: 10,
        date: '2026-09-24',
        status: AttendanceStatus.PRESENT,
        notes: 'Old note',
      };

      attendanceRepository.findOne
        .mockResolvedValueOnce(attendance)
        .mockResolvedValueOnce(null);

      attendanceRepository.save.mockResolvedValue(
        attendance,
      );

      await service.update(1, {
        notes: '   ',
      });

      expect(attendance.notes).toBeNull();

      expect(
        attendanceRepository.save,
      ).toHaveBeenCalledWith(
        attendance,
      );
    });
  });

  describe('remove', () => {
    it('should remove attendance successfully', async () => {
      const attendance = {
        id: 1,
        employeeId: 10,
        date: '2026-09-24',
      };

      attendanceRepository.findOne.mockResolvedValue(
        attendance,
      );

      attendanceRepository.remove.mockResolvedValue(
        attendance,
      );

      const result = await service.remove(1);

      expect(
        attendanceRepository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(
        attendanceRepository.remove,
      ).toHaveBeenCalledWith(
        attendance,
      );

      expect(result).toEqual({
        message:
          'Attendance record deleted successfully',
      });
    });
  });

  describe('getEmployeeCalendar', () => {
    it('should return attendance and related employee calendar data', async () => {
      const attendance = [
        {
          id: 1,
          employeeId: 10,
          date: '2026-09-24',
        },
      ];

      const leaves = [
        {
          id: 1,
          employeeId: 10,
          type: LeaveType.VACATION,
          startDate: '2026-09-25',
          endDate: '2026-09-26',
          status: LeaveStatus.APPROVED,
        },
      ];

      const absences = [
        {
          id: 1,
          employeeId: 10,
          date: '2026-09-27',
          status: AbsenceStatus.UNEXCUSED,
        },
      ];

      const overtime = [
        {
          id: 1,
          employeeId: 10,
          date: '2026-09-24',
          hours: 2,
          status: OvertimeStatus.APPROVED,
        },
      ];

      const calendarEvents = [
        {
          id: 1,
          title: 'Company Holiday',
          date: '2026-09-28',
          type: CalendarEventType.HOLIDAY,
        },
      ];

      const createQueryBuilder = (
        result: unknown,
      ) => {
        const queryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockResolvedValue(result),
        };

        return queryBuilder;
      };

      const attendanceQuery =
        createQueryBuilder(attendance);

      const leaveQuery =
        createQueryBuilder(leaves);

      const absenceQuery =
        createQueryBuilder(absences);

      const overtimeQuery =
        createQueryBuilder(overtime);

      const calendarQuery =
        createQueryBuilder(calendarEvents);

      attendanceRepository.createQueryBuilder.mockReturnValue(
        attendanceQuery,
      );

      leaveRepository.createQueryBuilder.mockReturnValue(
        leaveQuery,
      );

      absenceRepository.createQueryBuilder.mockReturnValue(
        absenceQuery,
      );

      overtimeRepository.createQueryBuilder.mockReturnValue(
        overtimeQuery,
      );

      calendarRepository.createQueryBuilder.mockReturnValue(
        calendarQuery,
      );

      const result =
        await service.getEmployeeCalendar(
          10,
          2026,
          9,
        );

      expect(result).toEqual({
        employeeId: 10,
        year: 2026,
        month: 9,
        attendance,
        leaves,
        absences,
        overtime,
        calendarEvents,
      });

      expect(
        attendanceRepository.createQueryBuilder,
      ).toHaveBeenCalledWith(
        'attendance',
      );

      expect(
        leaveRepository.createQueryBuilder,
      ).toHaveBeenCalledWith(
        'leave',
      );

      expect(
        absenceRepository.createQueryBuilder,
      ).toHaveBeenCalledWith(
        'absence',
      );

      expect(
        overtimeRepository.createQueryBuilder,
      ).toHaveBeenCalledWith(
        'overtime',
      );

      expect(
        calendarRepository.createQueryBuilder,
      ).toHaveBeenCalledWith(
        'calendar',
      );
    });
  });
});
