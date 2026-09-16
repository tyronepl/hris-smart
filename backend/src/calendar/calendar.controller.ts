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

import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  @Post()
  create(
    @Body()
    createCalendarEventDto: CreateCalendarEventDto,
  ) {
    return this.calendarService.create(
      createCalendarEventDto,
    );
  }

  @Get()
  findAll() {
    return this.calendarService.findAll();
  }

  @Get('year/:year')
  findByYear(
    @Param('year', ParseIntPipe) year: number,
  ) {
    return this.calendarService.findByYear(year);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateCalendarEventDto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.update(
      id,
      updateCalendarEventDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.calendarService.remove(id);
  }
}
