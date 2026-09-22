import { jest } from '@jest/globals';

import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { LeavesService } from '../../../src/leaves/leaves.service';
import {
  Leave,
  LeaveStatus,
  LeaveType,
} from '../../../src/leaves/leave.entity';

describe('LeavesService', () => {
  let service: LeavesService;

  const mockLeave: Leave = {
    id: 1,
    employeeId: 1,
    type: LeaveType.VACATION,
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    days: 3,
    reason: 'Family vacation',
    status: LeaveStatus.PENDING,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSickLeave: Leave = {
    id: 2,
    employeeId: 2,
    type: LeaveType.SICK,
    startDate: '2026-11-02',
    endDate: '2026-11-03',
    days: 2,
    reason: 'Not feeling well',
    status: LeaveStatus.APPROVED,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new LeavesService(
      repository as any,
    );
  });

  describe('create', () => {
    it('should create a leave request', async () => {
      const dto = {
        employeeId: 1,
        type: LeaveType.VACATION,
        startDate: '2026-10-12',
        endDate: '2026-10-14',
        days: 3,
        reason: 'Family vacation',
      };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );

      repository.create.mockReturnValue(
        mockLeave,
      );

      repository.save.mockResolvedValue(
        mockLeave,
      );

      const result =
        await service.create(dto);

      expect(
        repository.createQueryBuilder,
      ).toHaveBeenCalledWith('leave');

      expect(
        repository.create,
      ).toHaveBeenCalledWith({
        ...dto,
        status: LeaveStatus.PENDING,
        rejectionReason: null,
      });

      expect(
        repository.save,
      ).toHaveBeenCalledWith(
        mockLeave,
      );

      expect(result).toEqual(
        mockLeave,
      );
    });

    it('should throw when end date is before start date', async () => {
      const dto = {
        employeeId: 1,
        type: LeaveType.VACATION,
        startDate: '2026-10-15',
        endDate: '2026-10-12',
        days: 3,
        reason: 'Invalid date range',
      };

      await expect(
        service.create(dto),
      ).rejects.toThrow(
        new BadRequestException(
          'End date cannot be before start date',
        ),
      );

      expect(
        repository.createQueryBuilder,
      ).not.toHaveBeenCalled();

      expect(
        repository.save,
      ).not.toHaveBeenCalled();
    });

    it('should throw when employee has overlapping pending or approved leave', async () => {
      const dto = {
        employeeId: 1,
        type: LeaveType.VACATION,
        startDate: '2026-10-13',
        endDate: '2026-10-15',
        days: 3,
        reason: 'Another vacation',
      };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest
          .fn()
          .mockResolvedValue(mockLeave),
      };

      repository.createQueryBuilder.mockReturnValue(
        queryBuilder,
      );

      await expect(
        service.create(dto),
      ).rejects.toThrow(
        new BadRequestException(
          'Employee already has a pending or approved leave covering these dates',
        ),
      );

      expect(
        repository.create,
      ).not.toHaveBeenCalled();

      expect(
        repository.save,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all leave requests', async () => {
      repository.find.mockResolvedValue([
        mockLeave,
        mockSickLeave,
      ]);

      const result =
        await service.findAll();

      expect(
        repository.find,
      ).toHaveBeenCalledWith({
        order: {
          startDate: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([
        mockLeave,
        mockSickLeave,
      ]);
    });

    it('should return an empty array', async () => {
      repository.find.mockResolvedValue([]);

      const result =
        await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a leave request', async () => {
      repository.findOne.mockResolvedValue(
        mockLeave,
      );

      const result =
        await service.findOne(1);

      expect(
        repository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(
        mockLeave,
      );
    });

    it('should throw when leave request does not exist', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(999),
      ).rejects.toThrow(
        new NotFoundException(
          'Leave request not found',
        ),
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return leave requests for an employee', async () => {
      repository.find.mockResolvedValue([
        mockLeave,
      ]);

      const result =
        await service.findByEmployee(1);

      expect(
        repository.find,
      ).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
        },
        order: {
          startDate: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([
        mockLeave,
      ]);
    });

    it('should return an empty array when employee has no leave requests', async () => {
      repository.find.mockResolvedValue([]);

      const result =
        await service.findByEmployee(999);

      expect(result).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should approve a leave request', async () => {
      const leave = {
        ...mockLeave,
      };

      repository.findOne.mockResolvedValue(
        leave,
      );

      repository.save.mockResolvedValue({
        ...leave,
        status: LeaveStatus.APPROVED,
      });

      const result =
        await service.updateStatus(1, {
          status: LeaveStatus.APPROVED,
        });

      expect(leave.status).toBe(
        LeaveStatus.APPROVED,
      );

      expect(
        leave.rejectionReason,
      ).toBeNull();

      expect(
        repository.save,
      ).toHaveBeenCalledWith(leave);

      expect(result.status).toBe(
        LeaveStatus.APPROVED,
      );
    });

    it('should reject a leave request with a rejection reason', async () => {
      const leave = {
        ...mockLeave,
      };

      repository.findOne.mockResolvedValue(
        leave,
      );

      repository.save.mockResolvedValue({
        ...leave,
        status: LeaveStatus.REJECTED,
        rejectionReason:
          'Insufficient leave balance',
      });

      const result =
        await service.updateStatus(1, {
          status: LeaveStatus.REJECTED,
          rejectionReason:
            'Insufficient leave balance',
        });

      expect(leave.status).toBe(
        LeaveStatus.REJECTED,
      );

      expect(
        leave.rejectionReason,
      ).toBe(
        'Insufficient leave balance',
      );

      expect(
        repository.save,
      ).toHaveBeenCalledWith(leave);

      expect(result.status).toBe(
        LeaveStatus.REJECTED,
      );
    });

    it('should throw when rejecting without a rejection reason', async () => {
      repository.findOne.mockResolvedValue(
        mockLeave,
      );

      await expect(
        service.updateStatus(1, {
          status: LeaveStatus.REJECTED,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'A rejection reason is required',
        ),
      );

      expect(
        repository.save,
      ).not.toHaveBeenCalled();
    });

    it('should clear the rejection reason when status is not rejected', async () => {
      const leave = {
        ...mockLeave,
        status: LeaveStatus.REJECTED,
        rejectionReason:
          'Previous rejection',
      };

      repository.findOne.mockResolvedValue(
        leave,
      );

      repository.save.mockResolvedValue(
        leave,
      );

      await service.updateStatus(1, {
        status: LeaveStatus.APPROVED,
      });

      expect(leave.status).toBe(
        LeaveStatus.APPROVED,
      );

      expect(
        leave.rejectionReason,
      ).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should cancel a pending leave request', async () => {
      const leave = {
        ...mockLeave,
        status: LeaveStatus.PENDING,
      };

      repository.findOne.mockResolvedValue(
        leave,
      );

      repository.save.mockResolvedValue(
        leave,
      );

      const result =
        await service.cancel(1);

      expect(leave.status).toBe(
        LeaveStatus.CANCELLED,
      );

      expect(
        repository.save,
      ).toHaveBeenCalledWith(leave);

      expect(result).toEqual(leave);
    });

    it('should throw when cancelling a non-pending leave request', async () => {
      const leave = {
        ...mockLeave,
        status: LeaveStatus.APPROVED,
      };

      repository.findOne.mockResolvedValue(
        leave,
      );

      await expect(
        service.cancel(1),
      ).rejects.toThrow(
        new BadRequestException(
          'Only pending leave requests can be cancelled',
        ),
      );

      expect(
        repository.save,
      ).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a leave request', async () => {
      repository.findOne.mockResolvedValue(
        mockLeave,
      );

      repository.remove.mockResolvedValue(
        mockLeave,
      );

      const result =
        await service.remove(1);

      expect(
        repository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(
        repository.remove,
      ).toHaveBeenCalledWith(
        mockLeave,
      );

      expect(result).toEqual({
        message:
          'Leave request deleted successfully',
      });
    });

    it('should throw when deleting a leave request that does not exist', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.remove(999),
      ).rejects.toThrow(
        new NotFoundException(
          'Leave request not found',
        ),
      );

      expect(
        repository.remove,
      ).not.toHaveBeenCalled();
    });
  });
});
