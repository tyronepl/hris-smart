import { jest } from '@jest/globals';
import { OvertimeController } from '../../../src/overtime/overtime.controller';
import { OvertimeService } from '../../../src/overtime/overtime.service';
import { OvertimeStatus } from '../../../src/overtime/overtime.entity';

describe('OvertimeController', () => {
  let controller: OvertimeController;

  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmployee: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new OvertimeController(
      service as unknown as OvertimeService,
    );
  });

  describe('create', () => {
    it('should call the service create method', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        startTime: '18:00',
        endTime: '21:00',
        hours: 3,
        reason: 'Deployment',
      };

      const expectedResult = {
        id: 1,
        ...dto,
        status: OvertimeStatus.PENDING,
      };

      service.create.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(
        dto,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findAll', () => {
    it('should call the service findAll method', async () => {
      const expectedResult = [
        {
          id: 1,
          employeeId: 1,
          date: '2026-09-24',
        },
      ];

      service.findAll.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByEmployee', () => {
    it('should call the service findByEmployee method', async () => {
      const employeeId = 1;

      const expectedResult = [
        {
          id: 1,
          employeeId: 1,
          date: '2026-09-24',
        },
      ];

      service.findByEmployee.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findByEmployee(
          employeeId,
        );

      expect(
        service.findByEmployee,
      ).toHaveBeenCalledWith(
        employeeId,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne', () => {
    it('should call the service findOne method', async () => {
      const id = 1;

      const expectedResult = {
        id: 1,
        employeeId: 1,
      };

      service.findOne.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(
        id,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('update', () => {
    it('should call the service update method', async () => {
      const id = 1;

      const dto = {
        hours: 4,
        reason: 'Extended deployment',
      };

      const expectedResult = {
        id: 1,
        ...dto,
      };

      service.update.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.update(
          id,
          dto,
        );

      expect(service.update).toHaveBeenCalledWith(
        id,
        dto,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('updateStatus', () => {
    it('should call the service updateStatus method', async () => {
      const id = 1;

      const dto = {
        status: OvertimeStatus.APPROVED,
      };

      const expectedResult = {
        id: 1,
        status: OvertimeStatus.APPROVED,
      };

      service.updateStatus.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.updateStatus(
          id,
          dto,
        );

      expect(
        service.updateStatus,
      ).toHaveBeenCalledWith(
        id,
        dto,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('remove', () => {
    it('should call the service remove method', async () => {
      const id = 1;

      const expectedResult = {
        message:
          'Overtime record deleted successfully',
      };

      service.remove.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(
        id,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });
});
