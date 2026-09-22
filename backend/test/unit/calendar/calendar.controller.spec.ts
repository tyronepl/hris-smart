import { jest } from '@jest/globals';

import { CalendarController } from '../../../src/calendar/calendar.controller';
import { CalendarEventType } from '../../../src/calendar/entities/calendar-event.entity';

describe('CalendarController', () => {
  let controller: CalendarController;

  const calendarService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByYear: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new CalendarController(
      calendarService as any,
    );
  });

  describe('create', () => {
    it('should create a calendar event', async () => {
      const dto = {
        title: 'Team Meeting',
        description: 'Weekly team meeting',
        date: '2026-09-20',
        type: CalendarEventType.EVENT,
      };

      const expectedResult = {
        id: 1,
        ...dto,
      };

      calendarService.create.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.create(dto);

      expect(
        calendarService.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(
        expectedResult,
      );
    });

    it('should create a holiday', async () => {
      const dto = {
        title: 'Christmas Day',
        description: 'Office closed',
        date: '2026-12-25',
        type: CalendarEventType.HOLIDAY,
      };

      const expectedResult = {
        id: 2,
        ...dto,
      };

      calendarService.create.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.create(dto);

      expect(
        calendarService.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findAll', () => {
    it('should return all calendar items', async () => {
      const expectedResult = [
        {
          id: 1,
          title: 'Team Meeting',
          description: 'Weekly team meeting',
          date: '2026-09-20',
          type: CalendarEventType.EVENT,
        },
        {
          id: 2,
          title: 'Christmas Day',
          description: 'Office closed',
          date: '2026-12-25',
          type: CalendarEventType.HOLIDAY,
        },
      ];

      calendarService.findAll.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findAll();

      expect(
        calendarService.findAll,
      ).toHaveBeenCalled();

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findByYear', () => {
    it('should return calendar items for a year', async () => {
      const year = 2026;

      const expectedResult = [
        {
          id: 1,
          title: 'Team Meeting',
          date: '2026-09-20',
          type: CalendarEventType.EVENT,
        },
        {
          id: 2,
          title: 'Christmas Day',
          date: '2026-12-25',
          type: CalendarEventType.HOLIDAY,
        },
      ];

      calendarService.findByYear.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findByYear(year);

      expect(
        calendarService.findByYear,
      ).toHaveBeenCalledWith(year);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('findOne', () => {
    it('should return one calendar item', async () => {
      const expectedResult = {
        id: 1,
        title: 'Team Meeting',
        description: 'Weekly team meeting',
        date: '2026-09-20',
        type: CalendarEventType.EVENT,
      };

      calendarService.findOne.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.findOne(1);

      expect(
        calendarService.findOne,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('update', () => {
    it('should update a calendar item', async () => {
      const dto = {
        title: 'Updated Team Meeting',
        description: 'Updated description',
      };

      const expectedResult = {
        id: 1,
        title: 'Updated Team Meeting',
        description: 'Updated description',
        date: '2026-09-20',
        type: CalendarEventType.EVENT,
      };

      calendarService.update.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.update(
          1,
          dto,
        );

      expect(
        calendarService.update,
      ).toHaveBeenCalledWith(
        1,
        dto,
      );

      expect(result).toEqual(
        expectedResult,
      );
    });
  });

  describe('remove', () => {
    it('should delete a calendar item', async () => {
      const expectedResult = {
        message:
          'Calendar event deleted successfully',
      };

      calendarService.remove.mockResolvedValue(
        expectedResult,
      );

      const result =
        await controller.remove(1);

      expect(
        calendarService.remove,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(
        expectedResult,
      );
    });
  });
});
