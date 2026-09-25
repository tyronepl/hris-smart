import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';

import { Payroll } from '../../../src/payroll/entities/payroll.entity';
import { PayrollService } from '../../../src/payroll/payroll.service';

describe('PayrollService', () => {
  let service: PayrollService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new PayrollService(
      repository as any,
    );
  });

  describe('create', () => {
    it('should create a payroll record with calculated values', async () => {
      const dto = {
        employeeId: 1,
        periodStart: '2026-09-01',
        periodEnd: '2026-09-15',
        payDate: '2026-09-15',
        basicPay: 30000,
        overtimePay: 2500,
        holidayPay: 1000,
        nightDifferential: 500,
        allowances: 1500,
        bonus: 2000,
        otherDeductions: 500,
        sssRate: 5,
        philhealthRate: 2.5,
        pagibigRate: 2,
        withholdingTaxRate: 5,
      };

      const payroll = {
        id: 1,
        employeeId: 1,
        ...dto,
        grossPay: 37500,
        sss: 1875,
        philhealth: 937.5,
        pagibig: 750,
        withholdingTax: 1875,
        totalDeductions: 5937.5,
        netPay: 31562.5,
        status: 'DRAFT',
      };

      repository.create.mockReturnValue(payroll);
      repository.save.mockResolvedValue(payroll);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        employeeId: 1,

        periodStart: '2026-09-01',
        periodEnd: '2026-09-15',
        payDate: '2026-09-15',

        basicPay: 30000,
        overtimePay: 2500,
        holidayPay: 1000,
        nightDifferential: 500,
        allowances: 1500,
        bonus: 2000,

        grossPay: 37500,

        sssRate: 5,
        sss: 1875,

        philhealthRate: 2.5,
        philhealth: 937.5,

        pagibigRate: 2,
        pagibig: 750,

        withholdingTaxRate: 5,
        withholdingTax: 1875,

        otherDeductions: 500,

        totalDeductions: 5937.5,
        netPay: 31562.5,

        status: 'DRAFT',
      });

      expect(repository.save).toHaveBeenCalledWith(payroll);
      expect(result).toEqual(payroll);
    });

    it('should use default rates when rates are not provided', async () => {
      const dto = {
        employeeId: 1,
        periodStart: '2026-09-01',
        periodEnd: '2026-09-15',
        basicPay: 30000,
      };

      const payroll = {
        id: 1,
        employeeId: 1,
        grossPay: 30000,
        sssRate: 5,
        sss: 1500,
        philhealthRate: 2.5,
        philhealth: 750,
        pagibigRate: 2,
        pagibig: 600,
        withholdingTaxRate: 0,
        withholdingTax: 0,
        otherDeductions: 0,
        totalDeductions: 2850,
        netPay: 27150,
        status: 'DRAFT',
      };

      repository.create.mockReturnValue(payroll);
      repository.save.mockResolvedValue(payroll);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sssRate: 5,
          philhealthRate: 2.5,
          pagibigRate: 2,
          withholdingTaxRate: 0,
          grossPay: 30000,
          sss: 1500,
          philhealth: 750,
          pagibig: 600,
          withholdingTax: 0,
          otherDeductions: 0,
          totalDeductions: 2850,
          netPay: 27150,
          status: 'DRAFT',
        }),
      );

      expect(result).toEqual(payroll);
    });

    it('should use zero for optional payroll fields', async () => {
      const dto = {
        employeeId: 1,
        periodStart: '2026-09-01',
        periodEnd: '2026-09-15',
        basicPay: 30000,
      };

      const payroll = {
        id: 1,
        employeeId: 1,
        grossPay: 30000,
        sssRate: 5,
        sss: 1500,
        philhealthRate: 2.5,
        philhealth: 750,
        pagibigRate: 2,
        pagibig: 600,
        withholdingTaxRate: 0,
        withholdingTax: 0,
        otherDeductions: 0,
        totalDeductions: 2850,
        netPay: 27150,
        status: 'DRAFT',
      };

      repository.create.mockReturnValue(payroll);
      repository.save.mockResolvedValue(payroll);

      await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          overtimePay: 0,
          holidayPay: 0,
          nightDifferential: 0,
          allowances: 0,
          bonus: 0,
          otherDeductions: 0,
          payDate: null,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all payroll records', async () => {
      const payrolls = [
        {
          id: 1,
          employeeId: 1,
        },
        {
          id: 2,
          employeeId: 2,
        },
      ];

      repository.find.mockResolvedValue(payrolls);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(payrolls);
    });
  });

  describe('findOne', () => {
    it('should return a payroll record', async () => {
      const payroll = {
        id: 1,
        employeeId: 1,
      };

      repository.findOne.mockResolvedValue(payroll);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(payroll);
    });

    it('should throw when payroll does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999))
        .rejects
        .toThrow('Payroll not found');
    });
  });

  describe('approve', () => {
    it('should approve a payroll record', async () => {
      const payroll = {
        id: 1,
        employeeId: 1,
        status: 'DRAFT',
      };

      repository.findOne.mockResolvedValue(payroll);
      repository.save.mockResolvedValue({
        ...payroll,
        status: 'APPROVED',
      });

      const result = await service.approve(1);

      expect(payroll.status).toBe('APPROVED');

      expect(repository.save).toHaveBeenCalledWith(payroll);

      expect(result).toEqual({
        ...payroll,
        status: 'APPROVED',
      });
    });
  });

  describe('markAsPaid', () => {
    it('should mark a payroll record as paid', async () => {
      const payroll = {
        id: 1,
        employeeId: 1,
        status: 'APPROVED',
      };

      repository.findOne.mockResolvedValue(payroll);
      repository.save.mockResolvedValue({
        ...payroll,
        status: 'PAID',
      });

      const result = await service.markAsPaid(1);

      expect(payroll.status).toBe('PAID');

      expect(repository.save).toHaveBeenCalledWith(payroll);

      expect(result).toEqual({
        ...payroll,
        status: 'PAID',
      });
    });
  });

  describe('remove', () => {
    it('should remove a payroll record', async () => {
      const payroll = {
        id: 1,
        employeeId: 1,
      };

      repository.findOne.mockResolvedValue(payroll);
      repository.remove.mockResolvedValue(payroll);

      const result = await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(repository.remove).toHaveBeenCalledWith(payroll);

      expect(result).toEqual({
        message: 'Payroll deleted successfully',
      });
    });

    it('should throw when removing a payroll record that does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999))
        .rejects
        .toThrow(NotFoundException);

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
