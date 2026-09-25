import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { PayrollService } from './payroll.service';
import { PayrollPdfService } from './payroll-pdf.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly payrollPdfService: PayrollPdfService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(
    @Body()
    dto: CreatePayrollDto,
  ) {
    const payroll =
      await this.payrollService.create(dto);

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'PAYROLL',
      recordId: payroll.id,
      description: `Created payroll record #${payroll.id} for employee ${payroll.employeeId}`,
      newData: payroll,
    });

    return payroll;
  }

  @Get()
  findAll() {
    return this.payrollService.findAll();
  }

  @Get(':id/payslip')
  async payslip(
    @Param('id', ParseIntPipe)
    id: number,

    @Res()
    response: Response,
  ) {
    const pdf =
      await this.payrollPdfService.generatePayslip(
        id,
      );

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        `attachment; filename="payslip-${id}.pdf"`,
      'Content-Length': pdf.length,
    });

    response.end(pdf);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.payrollService.findOne(id);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const payroll =
      await this.payrollService.approve(id);

    await this.auditLogsService.create({
      action: 'APPROVE',
      module: 'PAYROLL',
      recordId: id,
      description: `Approved payroll record`,
      newData: payroll,
    });

    return payroll;
  }

  @Patch(':id/paid')
  async markAsPaid(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const payroll =
      await this.payrollService.markAsPaid(id);

    await this.auditLogsService.create({
      action: 'PAID',
      module: 'PAYROLL',
      recordId: id,
      description: `Marked payroll record as paid`,
      newData: payroll,
    });

    return payroll;
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const result =
      await this.payrollService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'PAYROLL',
      recordId: id,
      description: `Deleted payroll record`,
    });

    return result;
  }
}
