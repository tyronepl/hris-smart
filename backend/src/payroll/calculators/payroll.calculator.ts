export interface PayrollCalculation {
  grossPay: number;

  sss: number;
  philhealth: number;
  pagibig: number;
  withholdingTax: number;

  totalDeductions: number;
  netPay: number;
}

export function calculatePayroll(data: {
  basicPay: number;
  overtimePay?: number;
  holidayPay?: number;
  nightDifferential?: number;
  allowances?: number;
  bonus?: number;

  sssRate: number;
  philhealthRate: number;
  pagibigRate: number;
  withholdingTaxRate: number;

  otherDeductions?: number;
}): PayrollCalculation {
  const basicPay = Number(data.basicPay || 0);
  const overtimePay = Number(data.overtimePay || 0);
  const holidayPay = Number(data.holidayPay || 0);
  const nightDifferential = Number(data.nightDifferential || 0);
  const allowances = Number(data.allowances || 0);
  const bonus = Number(data.bonus || 0);

  const grossPay =
    basicPay +
    overtimePay +
    holidayPay +
    nightDifferential +
    allowances +
    bonus;

  const sss =
    grossPay * (Number(data.sssRate || 0) / 100);

  const philhealth =
    grossPay * (Number(data.philhealthRate || 0) / 100);

  const pagibig =
    grossPay * (Number(data.pagibigRate || 0) / 100);

  const withholdingTax =
    grossPay * (Number(data.withholdingTaxRate || 0) / 100);

  const otherDeductions =
    Number(data.otherDeductions || 0);

  const totalDeductions =
    sss +
    philhealth +
    pagibig +
    withholdingTax +
    otherDeductions;

  const netPay = grossPay - totalDeductions;

  return {
    grossPay: Number(grossPay.toFixed(2)),
    sss: Number(sss.toFixed(2)),
    philhealth: Number(philhealth.toFixed(2)),
    pagibig: Number(pagibig.toFixed(2)),
    withholdingTax: Number(withholdingTax.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netPay: Number(netPay.toFixed(2)),
  };
}
