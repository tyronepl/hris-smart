import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from './entities/calendar-event.entity';

@Module({
  imports: [
    AuthModule,
    AuditLogsModule,

    TypeOrmModule.forFeature([
      CalendarEvent,
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}