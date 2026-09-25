import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { Leave } from './leave.entity';

import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';

@Module({
  imports: [
    AuthModule,
    AuditLogsModule,

    TypeOrmModule.forFeature([
      Leave,
    ]),
  ],

  controllers: [
    LeavesController,
  ],

  providers: [
    LeavesService,
  ],

  exports: [
    LeavesService,
  ],
})
export class LeavesModule {}