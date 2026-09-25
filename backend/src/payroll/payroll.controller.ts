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

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly payrollPdfService: PayrollPdfService,
  ) {}

  @Post()
  create(@Body() dto: CreatePayrollDto) {
    return this.payrollService.create(dto);
  }

  @Get()
  findAll() {
    return this.payrollService.findAll();
  }

  @Get(':id/payslip')
  async payslip(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const pdf =
      await this.payrollPdfService.generatePayslip(
        id,
      );

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="payslip-${id}.pdf"`,
      'Content-Length': pdf.length,
    });

    response.end(pdf);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payrollService.findOne(id);
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payrollService.approve(id);
  }

  @Patch(':id/paid')
  markAsPaid(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payrollService.markAsPaid(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payrollService.remove(id);
  }
}
