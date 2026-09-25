import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { Absence } from './absence.entity';

import { AbsencesController } from './absences.controller';
import { AbsencesService } from './absences.service';

@Module({
  imports: [
    AuthModule,
    AuditLogsModule,

    TypeOrmModule.forFeature([
      Absence,
    ]),
  ],
  controllers: [
    AbsencesController,
  ],
  providers: [
    AbsencesService,
  ],
  exports: [
    AbsencesService,
  ],
})
export class AbsencesModule {}