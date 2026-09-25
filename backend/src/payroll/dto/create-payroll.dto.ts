import {
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreatePayrollDto {
  @IsNumber()
  employeeId: number;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsOptional()
  @IsDateString()
  payDate?: string;

  @IsNumber()
  @Min(0)
  basicPay: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimePay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  holidayPay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nightDifferential?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otherDeductions?: number;

  /*
   * Percentage rates.
   *
   * Example:
   * 4.5 = 4.5%
   * 2.5 = 2.5%
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  sssRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  philhealthRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pagibigRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  withholdingTaxRate?: number;
}
