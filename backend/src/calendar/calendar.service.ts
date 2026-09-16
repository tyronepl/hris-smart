import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalendarEvent } from './entities/calendar-event.entity';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarEventType } from './entities/calendar-event.entity';

@Injectable()
export class CalendarService implements OnModuleInit {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarRepository: Repository<CalendarEvent>,
  ) {}

  async onModuleInit() {
    await this.seed2026Holidays();
  }

  async create(
    createCalendarEventDto: CreateCalendarEventDto,
  ): Promise<CalendarEvent> {
    const event =
      this.calendarRepository.create(
        createCalendarEventDto,
      );

    return this.calendarRepository.save(event);
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.calendarRepository.find({
      order: {
        date: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async findByYear(
    year: number,
  ): Promise<CalendarEvent[]> {
    return this.calendarRepository
      .createQueryBuilder('event')
      .where('YEAR(event.date) = :year', {
        year,
      })
      .orderBy('event.date', 'ASC')
      .addOrderBy('event.createdAt', 'ASC')
      .getMany();
  }

  async findOne(
    id: number,
  ): Promise<CalendarEvent> {
    const event =
      await this.calendarRepository.findOne({
        where: { id },
      });

    if (!event) {
      throw new NotFoundException(
        'Calendar event not found',
      );
    }

    return event;
  }

  async update(
    id: number,
    updateCalendarEventDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    const event = await this.findOne(id);

    Object.assign(
      event,
      updateCalendarEventDto,
    );

    return this.calendarRepository.save(event);
  }

  async remove(
    id: number,
  ): Promise<{ message: string }> {
    const event = await this.findOne(id);

    await this.calendarRepository.remove(event);

    return {
      message:
        'Calendar event deleted successfully',
    };
  }

  private async seed2026Holidays(): Promise<void> {
    const holidays = [
      {
        date: '2026-01-01',
        title: "New Year's Day",
        description: 'Regular Holiday',
      },
      {
        date: '2026-02-17',
        title: 'Chinese New Year',
        description: 'Special Non-Working Day',
      },
      {
        date: '2026-03-20',
        title: "Eid'l Fitr",
        description: 'Regular Holiday',
      },
      {
        date: '2026-04-02',
        title: 'Maundy Thursday',
        description: 'Regular Holiday',
      },
      {
        date: '2026-04-03',
        title: 'Good Friday',
        description: 'Regular Holiday',
      },
      {
        date: '2026-04-04',
        title: 'Black Saturday',
        description: 'Additional Special Non-Working Day',
      },
      {
        date: '2026-04-09',
        title: 'Araw ng Kagitingan',
        description: 'Regular Holiday',
      },
      {
        date: '2026-05-01',
        title: 'Labor Day',
        description: 'Regular Holiday',
      },
      {
        date: '2026-05-27',
        title: "Eid'l Adha",
        description: 'Regular Holiday',
      },
      {
        date: '2026-06-12',
        title: 'Independence Day',
        description: 'Regular Holiday',
      },
      {
        date: '2026-08-21',
        title: 'Ninoy Aquino Day',
        description: 'Special Non-Working Day',
      },
      {
        date: '2026-08-31',
        title: 'National Heroes Day',
        description: 'Regular Holiday',
      },
      {
        date: '2026-11-01',
        title: "All Saints' Day",
        description: 'Special Non-Working Day',
      },
      {
        date: '2026-11-02',
        title: "All Souls' Day",
        description:
          'Additional Special Non-Working Day',
      },
      {
        date: '2026-11-30',
        title: 'Bonifacio Day',
        description: 'Regular Holiday',
      },
      {
        date: '2026-12-08',
        title:
          'Feast of the Immaculate Conception of Mary',
        description: 'Special Non-Working Day',
      },
      {
        date: '2026-12-24',
        title: 'Christmas Eve',
        description:
          'Additional Special Non-Working Day',
      },
      {
        date: '2026-12-25',
        title: 'Christmas Day',
        description: 'Regular Holiday',
      },
      {
        date: '2026-12-30',
        title: 'Rizal Day',
        description: 'Regular Holiday',
      },
      {
        date: '2026-12-31',
        title: 'Last Day of the Year',
        description: 'Special Non-Working Day',
      },
    ];

    for (const holiday of holidays) {
      const existing =
        await this.calendarRepository.findOne({
          where: {
            date: holiday.date,
            title: holiday.title,
            type: CalendarEventType.HOLIDAY,
          },
        });

      if (existing) {
        continue;
      }

      await this.calendarRepository.save(
        this.calendarRepository.create({
          title: holiday.title,
          description: holiday.description,
          date: holiday.date,
          type: CalendarEventType.HOLIDAY,
        }),
      );
    }
  }
}