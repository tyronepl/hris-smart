import { jest } from '@jest/globals';
import { AbsencesController } from '../../../src/absences/absences.controller';
import { AbsencesService } from '../../../src/absences/absences.service';
import { AbsenceStatus } from '../../../src/absences/absence.entity';

describe('AbsencesController', () => {
  let controller: AbsencesController;

  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmployee: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new AbsencesController(
      service as unknown as AbsencesService,
    );
  });

  describe('create', () => {
    it('should create an absence', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.EXCUSED,
        reason: 'Sick',
        notes: 'Medical certificate submitted',
      };

      const expectedResult = {
        id: 1,
        ...dto,
      };

      service.create.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.create(dto);

      expect(
        service.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findAll', () => {
    it('should return all absences', async () => {
      const expectedResult = [
        {
          id: 1,
          employeeId: 1,
          date: '2026-09-24',
          status: AbsenceStatus.EXCUSED,
        },
        {
          id: 2,
          employeeId: 2,
          date: '2026-09-23',
          status: AbsenceStatus.UNEXCUSED,
        },
      ];

      service.findAll.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findAll();

      expect(
        service.findAll,
      ).toHaveBeenCalledWith();

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return absences for an employee', async () => {
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
    it('should return an absence by id', async () => {
      const id = 1;

      const expectedResult = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      };

      service.findOne.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findOne(id);

      expect(
        service.findOne,
      ).toHaveBeenCalledWith(id);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('update', () => {
    it('should update an absence', async () => {
      const id = 1;

      const dto = {
        status: AbsenceStatus.EXCUSED,
        reason: 'Sick',
        notes: 'Doctor appointment',
      };

      const expectedResult = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
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

      expect(
        service.update,
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
    it('should remove an absence', async () => {
      const id = 1;

      const expectedResult = {
        message:
          'Absence record deleted successfully',
      };

      service.remove.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.remove(id);

      expect(
        service.remove,
      ).toHaveBeenCalledWith(id);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });
});
