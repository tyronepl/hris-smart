import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalendarService } from '../../../src/calendar/calendar.service';
import { CalendarEvent } from '../../../src/calendar/entities/calendar-event.entity';

describe('CalendarService', () => {
  let service: CalendarService;
  let repository: jest.Mocked<Repository<CalendarEvent>>;

  const mockEvent: CalendarEvent = {
    id: 1,
    title: 'Team Meeting',
    description: 'Weekly team meeting',
    date: '2026-09-20',
    type: 'EVENT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHoliday: CalendarEvent = {
    id: 2,
    title: 'Christmas Day',
    description: 'Office closed',
    date: '2026-12-25',
    type: 'HOLIDAY',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          CalendarService,
          {
            provide: getRepositoryToken(CalendarEvent),
            useValue: {
              create: jest.fn(),
              save: jest.fn(),
              find: jest.fn(),
              findOne: jest.fn(),
              remove: jest.fn(),
            },
          },
        ],
      }).compile();

    service = module.get<CalendarService>(
      CalendarService,
    );

    repository =
      module.get(
        getRepositoryToken(CalendarEvent),
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const dto = {
        title: 'Team Meeting',
        description: 'Weekly team meeting',
        date: '2026-09-20',
        type: 'EVENT' as const,
      };

      repository.create.mockReturnValue(
        mockEvent,
      );

      repository.save.mockResolvedValue(
        mockEvent,
      );

      const result =
        await service.create(dto);

      expect(
        repository.create,
      ).toHaveBeenCalledWith(dto);

      expect(
        repository.save,
      ).toHaveBeenCalledWith(
        mockEvent,
      );

      expect(result).toEqual(
        mockEvent,
      );
    });

    it('should create a holiday', async () => {
      const dto = {
        title: 'Christmas Day',
        description: 'Office closed',
        date: '2026-12-25',
        type: 'HOLIDAY' as const,
      };

      repository.create.mockReturnValue(
        mockHoliday,
      );

      repository.save.mockResolvedValue(
        mockHoliday,
      );

      const result =
        await service.create(dto);

      expect(
        repository.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(
        mockHoliday,
      );
    });
  });

  describe('findAll', () => {
    it('should return all calendar items', async () => {
      repository.find.mockResolvedValue([
        mockEvent,
        mockHoliday,
      ]);

      const result =
        await service.findAll();

      expect(
        repository.find,
      ).toHaveBeenCalled();

      expect(result).toEqual([
        mockEvent,
        mockHoliday,
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
    it('should return a calendar item', async () => {
      repository.findOne.mockResolvedValue(
        mockEvent,
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
        mockEvent,
      );
    });

    it('should throw when item does not exist', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(999),
      ).rejects.toThrow(
        'Calendar event not found',
      );
    });
  });

  describe('update', () => {
    it('should update a calendar item', async () => {
      const dto = {
        title: 'Updated Meeting',
      };

      repository.findOne.mockResolvedValue(
        mockEvent,
      );

      repository.save.mockResolvedValue({
        ...mockEvent,
        title: 'Updated Meeting',
      });

      const result =
        await service.update(
          1,
          dto,
        );

      expect(
        repository.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(
        repository.save,
      ).toHaveBeenCalled();

      expect(result.title).toBe(
        'Updated Meeting',
      );
    });

    it('should throw when item does not exist', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.update(999, {
          title: 'Updated',
        }),
      ).rejects.toThrow(
        'Calendar event not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete a calendar item', async () => {
      repository.findOne.mockResolvedValue(
        mockEvent,
      );

      repository.remove.mockResolvedValue(
        mockEvent,
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
        mockEvent,
      );

      expect(result).toEqual({
        message: 'Calendar event deleted successfully',
      });
    });

    it('should throw when item does not exist', async () => {
      repository.findOne.mockResolvedValue(
        null,
      );

      await expect(
        service.remove(999),
      ).rejects.toThrow(
        'Calendar event not found',
      );

      expect(
        repository.remove,
      ).not.toHaveBeenCalled();
    });
  });
});
