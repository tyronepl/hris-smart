import { jest } from '@jest/globals';
import { calculatePayroll } from '../../../src/payroll/calculators/payroll.calculator';

describe('Payroll Calculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate gross pay correctly', () => {
    const result = calculatePayroll({
      basicPay: 30000,
      overtimePay: 2500,
      holidayPay: 1000,
      nightDifferential: 500,
      allowances: 1500,
      bonus: 2000,
      sssRate: 5,
      philhealthRate: 2.5,
      pagibigRate: 2,
      withholdingTaxRate: 5,
      otherDeductions: 500,
    });

    expect(result.grossPay).toBe(37500);
  });

  it('should calculate percentage deductions correctly', () => {
    const result = calculatePayroll({
      basicPay: 30000,
      sssRate: 5,
      philhealthRate: 2.5,
      pagibigRate: 2,
      withholdingTaxRate: 5,
      otherDeductions: 500,
    });

    expect(result.sss).toBe(1500);
    expect(result.philhealth).toBe(750);
    expect(result.pagibig).toBe(600);
    expect(result.withholdingTax).toBe(1500);
    expect(result.totalDeductions).toBe(4850);
    expect(result.netPay).toBe(25150);
  });

  it('should calculate net pay correctly', () => {
    const result = calculatePayroll({
      basicPay: 50000,
      overtimePay: 5000,
      sssRate: 5,
      philhealthRate: 2.5,
      pagibigRate: 2,
      withholdingTaxRate: 5,
      otherDeductions: 1000,
    });

    expect(result.grossPay).toBe(55000);
    expect(result.totalDeductions).toBe(8975);
    expect(result.netPay).toBe(46025);
  });

  it('should handle zero tax', () => {
    const result = calculatePayroll({
      basicPay: 30000,
      sssRate: 5,
      philhealthRate: 2.5,
      pagibigRate: 2,
      withholdingTaxRate: 0,
    });

    expect(result.withholdingTax).toBe(0);
    expect(result.totalDeductions).toBe(2850);
    expect(result.netPay).toBe(27150);
  });
});
