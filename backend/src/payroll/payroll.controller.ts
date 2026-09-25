import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
  ) {}

  @Post()
  create(@Body() dto: CreatePayrollDto) {
    return this.payrollService.create(dto);
  }

  @Get()
  findAll() {
    return this.payrollService.findAll();
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
