import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payroll } from './entities/payroll.entity';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { calculatePayroll } from './calculators/payroll.calculator';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  async create(dto: CreatePayrollDto) {
    /*
     * Default percentage rates.
     *
     * These are configurable per payroll.
     * Do not treat these defaults as the current official
     * Philippine statutory contribution tables.
     */
    const sssRate = Number(dto.sssRate ?? 5);
    const philhealthRate = Number(dto.philhealthRate ?? 2.5);
    const pagibigRate = Number(dto.pagibigRate ?? 2);
    const withholdingTaxRate =
      Number(dto.withholdingTaxRate ?? 0);

    const calculation = calculatePayroll({
      basicPay: dto.basicPay,
      overtimePay: dto.overtimePay,
      holidayPay: dto.holidayPay,
      nightDifferential: dto.nightDifferential,
      allowances: dto.allowances,
      bonus: dto.bonus,

      sssRate,
      philhealthRate,
      pagibigRate,
      withholdingTaxRate,

      otherDeductions: dto.otherDeductions,
    });

    const payroll = this.payrollRepository.create({
      employeeId: dto.employeeId,

      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      payDate: dto.payDate ?? null,

      basicPay: dto.basicPay,
      overtimePay: dto.overtimePay ?? 0,
      holidayPay: dto.holidayPay ?? 0,
      nightDifferential: dto.nightDifferential ?? 0,
      allowances: dto.allowances ?? 0,
      bonus: dto.bonus ?? 0,

      grossPay: calculation.grossPay,

      sssRate,
      sss: calculation.sss,

      philhealthRate,
      philhealth: calculation.philhealth,

      pagibigRate,
      pagibig: calculation.pagibig,

      withholdingTaxRate,
      withholdingTax: calculation.withholdingTax,

      otherDeductions: dto.otherDeductions ?? 0,

      totalDeductions: calculation.totalDeductions,
      netPay: calculation.netPay,

      status: 'DRAFT',
    });

    return this.payrollRepository.save(payroll);
  }

  async findAll() {
    return this.payrollRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return payroll;
  }

  async approve(id: number) {
    const payroll = await this.findOne(id);

    payroll.status = 'APPROVED';

    return this.payrollRepository.save(payroll);
  }

  async markAsPaid(id: number) {
    const payroll = await this.findOne(id);

    payroll.status = 'PAID';

    return this.payrollRepository.save(payroll);
  }

  async remove(id: number) {
    const payroll = await this.findOne(id);

    await this.payrollRepository.remove(payroll);

    return {
      message: 'Payroll deleted successfully',
    };
  }
}