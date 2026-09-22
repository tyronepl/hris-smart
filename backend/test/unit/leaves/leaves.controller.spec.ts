import { jest } from '@jest/globals';

import { LeavesController } from '../../../src/leaves/leaves.controller';
import {
  LeaveStatus,
  LeaveType,
} from '../../../src/leaves/leave.entity';

describe('LeavesController', () => {
  let controller: LeavesController;

  const leavesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmployee: jest.fn(),
    updateStatus: jest.fn(),
    cancel: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new LeavesController(
      leavesService as any,
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

      const expectedResult = {
        id: 1,
        ...dto,
        status: LeaveStatus.PENDING,
      };

      leavesService.create.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.create(dto);

      expect(
        leavesService.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findAll', () => {
    it('should return all leave requests', async () => {
      const expectedResult = [
        {
          id: 1,
          employeeId: 1,
          type: LeaveType.VACATION,
          status: LeaveStatus.PENDING,
        },
        {
          id: 2,
          employeeId: 2,
          type: LeaveType.SICK,
          status: LeaveStatus.APPROVED,
        },
      ];

      leavesService.findAll.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findAll();

      expect(
        leavesService.findAll,
      ).toHaveBeenCalled();

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return leave requests for an employee', async () => {
      const employeeId = 1;

      const expectedResult = [
        {
          id: 1,
          employeeId,
          type: LeaveType.VACATION,
          status: LeaveStatus.PENDING,
        },
      ];

      leavesService.findByEmployee.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findByEmployee(
          employeeId,
        );

      expect(
        leavesService.findByEmployee,
      ).toHaveBeenCalledWith(
        employeeId,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne', () => {
    it('should return one leave request', async () => {
      const expectedResult = {
        id: 1,
        employeeId: 1,
        type: LeaveType.VACATION,
        status: LeaveStatus.PENDING,
      };

      leavesService.findOne.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findOne(1);

      expect(
        leavesService.findOne,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the leave status', async () => {
      const dto = {
        status: LeaveStatus.APPROVED,
      };

      const expectedResult = {
        id: 1,
        status: LeaveStatus.APPROVED,
      };

      leavesService.updateStatus.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.updateStatus(
          1,
          dto,
        );

      expect(
        leavesService.updateStatus,
      ).toHaveBeenCalledWith(
        1,
        dto,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });

    it('should reject a leave with a rejection reason', async () => {
      const dto = {
        status: LeaveStatus.REJECTED,
        rejectionReason:
          'Insufficient leave balance',
      };

      const expectedResult = {
        id: 1,
        status: LeaveStatus.REJECTED,
        rejectionReason:
          'Insufficient leave balance',
      };

      leavesService.updateStatus.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.updateStatus(
          1,
          dto,
        );

      expect(
        leavesService.updateStatus,
      ).toHaveBeenCalledWith(
        1,
        dto,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a leave request', async () => {
      const expectedResult = {
        id: 1,
        status: LeaveStatus.CANCELLED,
      };

      leavesService.cancel.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.cancel(1);

      expect(
        leavesService.cancel,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('remove', () => {
    it('should delete a leave request', async () => {
      const expectedResult = {
        message:
          'Leave request deleted successfully',
      };

      leavesService.remove.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.remove(1);

      expect(
        leavesService.remove,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });
});
