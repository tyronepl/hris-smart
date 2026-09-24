import { jest } from '@jest/globals';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  Overtime,
  OvertimeStatus,
} from '../../../src/overtime/overtime.entity';

import {
  OvertimeService,
} from '../../../src/overtime/overtime.service';

describe('OvertimeService', () => {
  let service: OvertimeService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new OvertimeService(
      repository as any,
    );
  });

  describe('create', () => {
    it('should create an overtime record', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '21:30',
        hours: 3.5,
        reason: 'Production deployment',
        notes: 'Approved by team lead',
      };

      repository.findOne.mockResolvedValue(null);

      const overtime = {
        id: 1,
        ...dto,
        status: OvertimeStatus.PENDING,
        rejectionReason: null,
      };

      repository.create.mockReturnValue(overtime);
      repository.save.mockResolvedValue(overtime);

      const result = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
          date: '2026-09-24',
          startTime: '18:00',
          endTime: '21:30',
        },
      });

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        status: OvertimeStatus.PENDING,
        notes: 'Approved by team lead',
        rejectionReason: null,
      });

      expect(repository.save).toHaveBeenCalledWith(
        overtime,
      );

      expect(result).toEqual(overtime);
    });

    it('should use null when notes are empty', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '20:00',
        hours: 2,
        reason: 'Deployment',
        notes: '   ',
      };

      repository.findOne.mockResolvedValue(null);

      const overtime = {
        id: 1,
        ...dto,
        notes: null,
        status: OvertimeStatus.PENDING,
        rejectionReason: null,
      };

      repository.create.mockReturnValue(overtime);
      repository.save.mockResolvedValue(overtime);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        status: OvertimeStatus.PENDING,
        notes: null,
        rejectionReason: null,
      });

      expect(result).toEqual(overtime);
    });

    it('should reject when end time is not later than start time', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        startTime: '21:00',
        endTime: '20:00',
        hours: 1,
        reason: 'Deployment',
      };

      await expect(
        service.create(dto),
      ).rejects.toThrow(BadRequestException);

      expect(repository.findOne).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject duplicate overtime records', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '21:00',
        hours: 3,
        reason: 'Deployment',
      };

      repository.findOne.mockResolvedValue({
        id: 10,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '21:00',
      });

      await expect(
        service.create(dto),
      ).rejects.toThrow(BadRequestException);

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all overtime records', async () => {
      const records = [
        {
          id: 2,
          employeeId: 2,
          date: '2026-09-25',
        },
        {
          id: 1,
          employeeId: 1,
          date: '2026-09-24',
        },
      ];

      repository.find.mockResolvedValue(records);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: {
          date: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(records);
    });
  });

  describe('findOne', () => {
    it('should return an overtime record by id', async () => {
      const overtime = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      };

      repository.findOne.mockResolvedValue(overtime);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(overtime);
    });

    it('should throw NotFoundException when record does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmployee', () => {
    it('should return overtime records for an employee', async () => {
      const records = [
        {
          id: 1,
          employeeId: 1,
          date: '2026-09-24',
        },
        {
          id: 2,
          employeeId: 1,
          date: '2026-09-20',
        },
      ];

      repository.find.mockResolvedValue(records);

      const result =
        await service.findByEmployee(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
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
    it('should update an overtime record', async () => {
      const overtime: Partial<Overtime> = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '20:00',
        hours: 2,
        reason: 'Deployment',
        status: OvertimeStatus.PENDING,
        notes: null,
      };

      repository.findOne
        .mockResolvedValueOnce(overtime)
        .mockResolvedValueOnce(null);

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(1, {
        endTime: '21:00',
        hours: 3,
      });

      expect(repository.save).toHaveBeenCalled();

      expect(result.endTime).toBe('21:00');
      expect(result.hours).toBe(3);
    });

    it('should reject invalid updated times', async () => {
      const overtime = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '20:00',
      };

      repository.findOne.mockResolvedValue(overtime);

      await expect(
        service.update(1, {
          startTime: '21:00',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject duplicate employee/date/time combination', async () => {
      const current = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '20:00',
      };

      const existing = {
        id: 2,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '19:00',
        endTime: '21:00',
      };

      repository.findOne
        .mockResolvedValueOnce(current)
        .mockResolvedValueOnce(existing);

      await expect(
        service.update(1, {
          startTime: '19:00',
          endTime: '21:00',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should allow updating the same record without treating itself as duplicate', async () => {
      const overtime = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '20:00',
        hours: 2,
      };

      repository.findOne
        .mockResolvedValueOnce(overtime)
        .mockResolvedValueOnce(overtime);

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(1, {
        endTime: '20:00',
      });

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(overtime);
    });

    it('should convert empty notes to null', async () => {
      const overtime = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '20:00',
        hours: 2,
        notes: 'Old notes',
      };

      repository.findOne
        .mockResolvedValueOnce(overtime)
        .mockResolvedValueOnce(null);

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result = await service.update(1, {
        notes: '   ',
      });

      expect(result.notes).toBeNull();
      expect(repository.save).toHaveBeenCalledWith(
        overtime,
      );
    });
  });

  describe('updateStatus', () => {
    it('should approve an overtime record', async () => {
      const overtime = {
        id: 1,
        status: OvertimeStatus.PENDING,
        rejectionReason: null,
      };

      repository.findOne.mockResolvedValue(overtime);
      repository.save.mockImplementation(
        async (value) => value,
      );

      const result =
        await service.updateStatus(1, {
          status: OvertimeStatus.APPROVED,
        });

      expect(result.status).toBe(
        OvertimeStatus.APPROVED,
      );

      expect(result.rejectionReason).toBeNull();
      expect(repository.save).toHaveBeenCalledWith(
        overtime,
      );
    });

    it('should reject an overtime record with a reason', async () => {
      const overtime = {
        id: 1,
        status: OvertimeStatus.PENDING,
        rejectionReason: null,
      };

      repository.findOne.mockResolvedValue(overtime);
      repository.save.mockImplementation(
        async (value) => value,
      );

      const result =
        await service.updateStatus(1, {
          status: OvertimeStatus.REJECTED,
          rejectionReason: 'Not authorized',
        });

      expect(result.status).toBe(
        OvertimeStatus.REJECTED,
      );

      expect(result.rejectionReason).toBe(
        'Not authorized',
      );
    });

    it('should require a rejection reason', async () => {
      const overtime = {
        id: 1,
        status: OvertimeStatus.PENDING,
      };

      repository.findOne.mockResolvedValue(overtime);

      await expect(
        service.updateStatus(1, {
          status: OvertimeStatus.REJECTED,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should clear rejection reason when overtime is approved', async () => {
      const overtime = {
        id: 1,
        status: OvertimeStatus.REJECTED,
        rejectionReason: 'Not authorized',
      };

      repository.findOne.mockResolvedValue(overtime);
      repository.save.mockImplementation(
        async (value) => value,
      );

      const result =
        await service.updateStatus(1, {
          status: OvertimeStatus.APPROVED,
        });

      expect(result.status).toBe(
        OvertimeStatus.APPROVED,
      );

      expect(result.rejectionReason).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete an overtime record', async () => {
      const overtime = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      };

      repository.findOne.mockResolvedValue(overtime);
      repository.remove.mockResolvedValue(overtime);

      const result = await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(
        overtime,
      );

      expect(result).toEqual({
        message:
          'Overtime record deleted successfully',
      });
    });

    it('should throw NotFoundException when deleting a missing record', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(999),
      ).rejects.toThrow(NotFoundException);

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
