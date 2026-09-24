import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import {
  Absence,
  AbsenceStatus,
} from '../../../src/absences/absence.entity';

import {
  AbsencesService,
} from '../../../src/absences/absences.service';

describe('AbsencesService', () => {
  let service: AbsencesService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AbsencesService(
      repository as any,
    );
  });

  describe('create', () => {
    it('should create an absence record', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.EXCUSED,
        reason: 'Sick',
        notes: 'Submitted medical certificate',
      };

      repository.findOne.mockResolvedValue(
        null,
      );

      const absence = {
        id: 1,
        ...dto,
      };

      repository.create.mockReturnValue(
        absence,
      );

      repository.save.mockResolvedValue(
        absence,
      );

      const result =
        await service.create(dto);

      expect(
        repository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
          date: '2026-09-24',
        },
      });

      expect(
        repository.create,
      ).toHaveBeenCalledWith({
        ...dto,
        notes:
          'Submitted medical certificate',
      });

      expect(
        repository.save,
      ).toHaveBeenCalledWith(
        absence,
      );

      expect(result).toEqual(
        absence,
      );
    });

    it('should create an absence with null notes when notes are empty', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.UNEXCUSED,
        reason: 'No show',
        notes: '   ',
      };

      repository.findOne.mockResolvedValue(
        null,
      );

      const absence = {
        id: 1,
        ...dto,
        notes: null,
      };

      repository.create.mockReturnValue(
        absence,
      );

      repository.save.mockResolvedValue(
        absence,
      );

      const result =
        await service.create(dto);

      expect(
        repository.create,
      ).toHaveBeenCalledWith({
        ...dto,
        notes: null,
      });

      expect(result).toEqual(
        absence,
      );
    });

    it('should reject duplicate absence for the same employee and date', async () => {
      const dto = {
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.UNEXCUSED,
        reason: 'No show',
      };

      repository.findOne.mockResolvedValue({
        id: 10,
        employeeId: 1,
        date: '2026-09-24',
      });

      await expect(
        service.create(dto),
      ).rejects.toThrow(
        BadRequestException,
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
    it('should return all absence records', async () => {
      const absences = [
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

      repository.find.mockResolvedValue(
        absences,
      );

      const result =
        await service.findAll();

      expect(
        repository.find,
      ).toHaveBeenCalledWith({
        order: {
          date: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(
        absences,
      );
    });
  });

  describe('findOne', () => {
    it('should return an absence by id', async () => {
      const absence = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      };

      repository.findOne.mockResolvedValue(
        absence,
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
        absence,
      );
    });

    it('should throw NotFoundException when absence does not exist', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(999),
      ).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return absences for an employee', async () => {
      const absences = [
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

      repository.find.mockResolvedValue(
        absences,
      );

      const result =
        await service.findByEmployee(1);

      expect(
        repository.find,
      ).toHaveBeenCalledWith({
        where: {
          employeeId: 1,
        },
        order: {
          date: 'DESC',
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(
        absences,
      );
    });
  });

  describe('update', () => {
    it('should update an absence', async () => {
      const absence: Partial<Absence> = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.UNEXCUSED,
        reason: 'No show',
        notes: null,
      };

      repository.findOne.mockResolvedValue(
        absence,
      );

      repository.save.mockResolvedValue({
        ...absence,
        status: AbsenceStatus.EXCUSED,
        reason: 'Sick',
      });

      const result =
        await service.update(1, {
          status: AbsenceStatus.EXCUSED,
          reason: 'Sick',
        });

      expect(
        repository.save,
      ).toHaveBeenCalled();

      expect(result.status).toBe(
        AbsenceStatus.EXCUSED,
      );

      expect(result.reason).toBe(
        'Sick',
      );
    });

    it('should reject updating to a duplicate employee/date combination', async () => {
      const currentAbsence = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.UNEXCUSED,
        reason: 'No show',
        notes: null,
      };

      const existingAbsence = {
        id: 2,
        employeeId: 1,
        date: '2026-09-25',
      };

      repository.findOne
        .mockResolvedValueOnce(
          currentAbsence,
        )
        .mockResolvedValueOnce(
          existingAbsence,
        );

      await expect(
        service.update(1, {
          date: '2026-09-25',
        }),
      ).rejects.toThrow(
        BadRequestException,
      );

      expect(
        repository.save,
      ).not.toHaveBeenCalled();
    });

    it('should allow updating the same record date without treating itself as a duplicate', async () => {
      const absence = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.UNEXCUSED,
        reason: 'No show',
        notes: null,
      };

      repository.findOne
        .mockResolvedValueOnce(
          absence,
        )
        .mockResolvedValueOnce(
          absence,
        );

      repository.save.mockResolvedValue(
        absence,
      );

      const result =
        await service.update(1, {
          date: '2026-09-24',
        });

      expect(
        repository.save,
      ).toHaveBeenCalled();

      expect(result).toEqual(
        absence,
      );
    });

    it('should convert empty notes to null', async () => {
      const absence = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
        status: AbsenceStatus.EXCUSED,
        reason: 'Sick',
        notes: 'Old notes',
      };

      repository.findOne.mockResolvedValue(
        absence,
      );

      repository.save.mockImplementation(
        async (value) => value,
      );

      const result =
        await service.update(1, {
          notes: '   ',
        });

      expect(result.notes).toBeNull();

      expect(
        repository.save,
      ).toHaveBeenCalledWith(
        absence,
      );
    });
  });

  describe('remove', () => {
    it('should delete an absence', async () => {
      const absence = {
        id: 1,
        employeeId: 1,
        date: '2026-09-24',
      };

      repository.findOne.mockResolvedValue(
        absence,
      );

      repository.remove.mockResolvedValue(
        absence,
      );

      const result =
        await service.remove(1);

      expect(
        repository.remove,
      ).toHaveBeenCalledWith(
        absence,
      );

      expect(result).toEqual({
        message:
          'Absence record deleted successfully',
      });
    });

    it('should throw NotFoundException when deleting a missing absence', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.remove(999),
      ).rejects.toThrow(
        NotFoundException,
      );

      expect(
        repository.remove,
      ).not.toHaveBeenCalled();
    });
  });
});
