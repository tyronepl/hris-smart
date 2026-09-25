import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import {
  Overtime,
} from './overtime.entity';

import {
  OvertimeController,
} from './overtime.controller';

import {
  OvertimeService,
} from './overtime.service';

@Module({
  imports: [
    AuthModule,
    AuditLogsModule,

    TypeOrmModule.forFeature([
      Overtime,
    ]),
  ],

  controllers: [
    OvertimeController,
  ],

  providers: [
    OvertimeService,
  ],

  exports: [
    OvertimeService,
  ],
})
export class OvertimeModule {}