import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import { Repository } from 'typeorm';

import { Payroll } from './entities/payroll.entity';

@Injectable()
export class PayrollPdfService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
  ) {}

  async generatePayslip(
    id: number,
  ): Promise<Buffer> {
    const payroll =
      await this.payrollRepository.findOne({
        where: { id },
        relations: { employee: true },
      });

    if (!payroll) {
      throw new NotFoundException(
        'Payroll not found',
      );
    }

    const employee = payroll.employee;

    const document = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const chunks: Buffer[] = [];

    document.on('data', (chunk) => {
      chunks.push(chunk);
    });

    const pdfBuffer = new Promise<Buffer>(
      (resolve, reject) => {
        document.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        document.on('error', reject);
      },
    );

    const money = (value: number) =>
      `PHP ${Number(value || 0).toLocaleString(
        'en-PH',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`;

    const formatDate = (
      value: string | Date | null,
    ) => {
      if (!value) {
        return '-';
      }

      return new Date(value).toLocaleDateString(
        'en-PH',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      );
    };

    const drawLine = () => {
      document
        .moveTo(50, document.y)
        .lineTo(545, document.y)
        .strokeColor('#cccccc')
        .stroke();

      document.moveDown(0.5);
    };

    const row = (
      label: string,
      value: number,
      bold = false,
    ) => {
      document
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(10)
        .fillColor('#000000')
        .text(label, 60, document.y, {
          continued: true,
          width: 300,
        })
        .text(money(value), {
          align: 'right',
          width: 180,
        });

      document.moveDown(0.4);
    };

    // Header
    document
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#1d4ed8')
      .text('HRIS SMART', {
        align: 'center',
      });

    document
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#000000')
      .text('PAYSLIP', {
        align: 'center',
      });

    document.moveDown(1);

    drawLine();

    // Employee information
    document
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('EMPLOYEE INFORMATION');

    document.moveDown(0.5);

    document
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000000');

    document.text(
      `Employee: ${
        employee
          ? `${employee.firstName} ${employee.lastName}`
          : 'Unknown'
      }`,
    );

    document.text(
      `Employee ID: ${payroll.employeeId}`,
    );

    document.text(
      `Department: ${
        employee?.department || '-'
      }`,
    );

    document.text(
      `Position: ${employee?.position || '-'}`,
    );

    document.moveDown(0.7);

    document.text(
      `Pay Period: ${formatDate(
        payroll.periodStart,
      )} - ${formatDate(payroll.periodEnd)}`,
    );

    document.text(
      `Pay Date: ${formatDate(payroll.payDate)}`,
    );

    document.text(
      `Status: ${payroll.status}`,
    );

    document.moveDown(1);

    drawLine();

    // Earnings
    document
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('EARNINGS');

    document.moveDown(0.5);

    row('Basic Pay', payroll.basicPay);
    row('Overtime Pay', payroll.overtimePay);
    row('Holiday Pay', payroll.holidayPay);
    row(
      'Night Differential',
      payroll.nightDifferential,
    );
    row('Allowances', payroll.allowances);
    row('Bonus', payroll.bonus);

    document.moveDown(0.3);

    row(
      'Gross Pay',
      payroll.grossPay,
      true,
    );

    document.moveDown(0.8);

    drawLine();

    // Deductions
    document
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#000000')
      .text('DEDUCTIONS');

    document.moveDown(0.5);

    row('SSS', payroll.sss);
    row('PhilHealth', payroll.philhealth);
    row('Pag-IBIG', payroll.pagibig);
    row(
      'Withholding Tax',
      payroll.withholdingTax,
    );
    row(
      'Other Deductions',
      payroll.otherDeductions,
    );

    document.moveDown(0.3);

    row(
      'Total Deductions',
      payroll.totalDeductions,
      true,
    );

    document.moveDown(1);

    drawLine();

    // Net pay
    document
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#000000')
      .text('NET PAY', 60, document.y, {
        continued: true,
        width: 250,
      })
      .fontSize(16)
      .fillColor('#1d4ed8')
      .text(money(payroll.netPay), {
        align: 'right',
        width: 230,
      });

    document.moveDown(2);

    drawLine();

    document
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'This payslip was generated by HRIS Smart.',
        {
          align: 'center',
        },
      );

    document.end();

    return pdfBuffer;
  }
}
