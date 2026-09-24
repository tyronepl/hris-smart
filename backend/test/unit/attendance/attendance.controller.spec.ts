import { jest } from '@jest/globals';

import { Test, TestingModule } from '@nestjs/testing';

import {
  AttendanceController,
} from '../../../src/attendance/attendance.controller';

import {
  AttendanceService,
} from '../../../src/attendance/attendance.service';

import {
  AttendanceStatus,
} from '../../../src/attendance/attendance.entity';

import {
  JwtAuthGuard,
} from '../../../src/auth/jwt-auth.guard';

describe('AttendanceController', () => {
  let controller: AttendanceController;

  const attendanceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmployee: jest.fn(),
    getEmployeeCalendar: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          AttendanceController,
        ],
        providers: [
          {
            provide: AttendanceService,
            useValue: attendanceService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: jest.fn(() => true),
        })
        .compile();

    controller =
      module.get<AttendanceController>(
        AttendanceController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call attendance service create', async () => {
      const dto = {
        employeeId: 10,
        date: '2026-09-24',
        clockIn: '08:00',
        clockOut: '17:00',
        hoursWorked: 8,
        status: AttendanceStatus.PRESENT,
      };

      const expected = {
        id: 1,
        ...dto,
      };

      attendanceService.create.mockResolvedValue(
        expected,
      );

      const result =
        await controller.create(dto);

      expect(
        attendanceService.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should call attendance service findAll', async () => {
      const expected = [
        {
          id: 1,
          employeeId: 10,
        },
      ];

      attendanceService.findAll.mockResolvedValue(
        expected,
      );

      const result =
        await controller.findAll();

      expect(
        attendanceService.findAll,
      ).toHaveBeenCalled();

      expect(result).toEqual(expected);
    });
  });

  describe('findByEmployee', () => {
    it('should call attendance service findByEmployee', async () => {
      const expected = [
        {
          id: 1,
          employeeId: 10,
        },
      ];

      attendanceService.findByEmployee.mockResolvedValue(
        expected,
      );

      const result =
        await controller.findByEmployee(10);

      expect(
        attendanceService.findByEmployee,
      ).toHaveBeenCalledWith(10);

      expect(result).toEqual(expected);
    });
  });

  describe('getEmployeeCalendar', () => {
    it('should call attendance service with numeric year and month', async () => {
      const expected = {
        employeeId: 10,
        year: 2026,
        month: 9,
        attendance: [],
        leaves: [],
        absences: [],
        overtime: [],
        calendarEvents: [],
      };

      attendanceService.getEmployeeCalendar.mockResolvedValue(
        expected,
      );

      const result =
        await controller.getEmployeeCalendar(
          10,
          '2026',
          '9',
        );

      expect(
        attendanceService.getEmployeeCalendar,
      ).toHaveBeenCalledWith(
        10,
        2026,
        9,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call attendance service findOne', async () => {
      const expected = {
        id: 1,
        employeeId: 10,
      };

      attendanceService.findOne.mockResolvedValue(
        expected,
      );

      const result =
        await controller.findOne(1);

      expect(
        attendanceService.findOne,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call attendance service update', async () => {
      const dto = {
        clockIn: '08:15',
        status: AttendanceStatus.LATE,
      };

      const expected = {
        id: 1,
        ...dto,
      };

      attendanceService.update.mockResolvedValue(
        expected,
      );

      const result =
        await controller.update(1, dto);

      expect(
        attendanceService.update,
      ).toHaveBeenCalledWith(
        1,
        dto,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call attendance service remove', async () => {
      const expected = {
        message:
          'Attendance record deleted successfully',
      };

      attendanceService.remove.mockResolvedValue(
        expected,
      );

      const result =
        await controller.remove(1);

      expect(
        attendanceService.remove,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(expected);
    });
  });
});
