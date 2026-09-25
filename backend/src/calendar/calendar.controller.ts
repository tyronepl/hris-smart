import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

import { CalendarService } from './calendar.service';

import {
  CreateCalendarEventDto,
} from './dto/create-calendar-event.dto';

import {
  UpdateCalendarEventDto,
} from './dto/update-calendar-event.dto';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(
    @Body()
    createCalendarEventDto: CreateCalendarEventDto,
  ) {
    const event =
      await this.calendarService.create(
        createCalendarEventDto,
      );

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'CALENDAR',
      recordId: event.id,
      description:
        `Created calendar event #${event.id}`,
      newData: event,
    });

    return event;
  }

  @Get()
  findAll() {
    return this.calendarService.findAll();
  }

  @Get('year/:year')
  findByYear(
    @Param('year', ParseIntPipe)
    year: number,
  ) {
    return this.calendarService.findByYear(
      year,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateCalendarEventDto: UpdateCalendarEventDto,
  ) {
    const event =
      await this.calendarService.update(
        id,
        updateCalendarEventDto,
      );

    await this.auditLogsService.create({
      action: 'UPDATE',
      module: 'CALENDAR',
      recordId: id,
      description:
        `Updated calendar event #${id}`,
      newData: event,
    });

    return event;
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const result =
      await this.calendarService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'CALENDAR',
      recordId: id,
      description:
        `Deleted calendar event #${id}`,
    });

    return result;
  }
}
