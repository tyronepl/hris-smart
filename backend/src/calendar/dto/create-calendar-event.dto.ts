import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { CalendarEventType } from '../entities/calendar-event.entity';

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsEnum(CalendarEventType)
  type: CalendarEventType;
}
