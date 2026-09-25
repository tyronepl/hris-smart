import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollPdfService } from './payroll-pdf.service';
import { Payroll } from './entities/payroll.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll]),
    AuditLogsModule,
  ],
  controllers: [
    PayrollController,
  ],
  providers: [
    PayrollService,
    PayrollPdfService,
  ],
  exports: [
    PayrollService,
  ],
})
export class PayrollModule {}