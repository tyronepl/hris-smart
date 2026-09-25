import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { Employee } from './entities/employee.entity';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { ResumeService } from './resume.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
    ]),
    AuthModule,
    AuditLogsModule,
  ],

  controllers: [
    EmployeesController,
  ],

  providers: [
    EmployeesService,
    ResumeService,
  ],

  exports: [
    EmployeesService,
  ],
})
export class EmployeesModule {}