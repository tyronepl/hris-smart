import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payroll } from './entities/payroll.entity';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollPdfService } from './payroll-pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll]),
  ],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    PayrollPdfService,
  ],
  exports: [
    PayrollService,
    PayrollPdfService,
  ],
})
export class PayrollModule {}
