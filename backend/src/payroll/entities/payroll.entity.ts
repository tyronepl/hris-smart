import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee, (employee) => employee.payrolls, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  periodStart: string;

  @Column({ type: 'date' })
  periodEnd: string;

  @Column({ type: 'date', nullable: true })
  payDate: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basicPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  holidayPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  nightDifferential: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  sssRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  sss: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  philhealthRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  philhealth: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pagibigRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pagibig: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  withholdingTaxRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  withholdingTax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay: number;

  @Column({ default: 'DRAFT' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
