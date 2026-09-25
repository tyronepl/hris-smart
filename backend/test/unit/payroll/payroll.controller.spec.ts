import { jest } from '@jest/globals';
import { PayrollController } from '../../../src/payroll/payroll.controller';
import { PayrollService } from '../../../src/payroll/payroll.service';

describe('PayrollController', () => {
  let controller: PayrollController;

  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    approve: jest.fn(),
    markAsPaid: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new PayrollController(
      service as unknown as PayrollService,
    );
  });

  describe('create', () => {
    it('should create a payroll record', async () => {
      const dto = {
        employeeId: 1,
        periodStart: '2026-09-01',
        periodEnd: '2026-09-15',
        payDate: '2026-09-15',
        basicPay: 30000,
        overtimePay: 2500,
        holidayPay: 0,
        nightDifferential: 0,
        allowances: 1500,
        bonus: 0,
        sssRate: 5,
        philhealthRate: 2.5,
        pagibigRate: 2,
        withholdingTaxRate: 5,
        otherDeductions: 500,
      };

      const expectedResult = {
        id: 1,
        employeeId: 1,
        ...dto,
        grossPay: 34000,
        sss: 1700,
        philhealth: 850,
        pagibig: 680,
        withholdingTax: 1700,
        totalDeductions: 5430,
        netPay: 28570,
        status: 'DRAFT',
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all payroll records', async () => {
      const expectedResult = [
        {
          id: 1,
          employeeId: 1,
          basicPay: 30000,
          grossPay: 30000,
          netPay: 25650,
          status: 'DRAFT',
        },
        {
          id: 2,
          employeeId: 2,
          basicPay: 40000,
          grossPay: 40000,
          netPay: 34200,
          status: 'APPROVED',
        },
      ];

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a payroll record by id', async () => {
      const id = 1;

      const expectedResult = {
        id: 1,
        employeeId: 1,
        basicPay: 30000,
        grossPay: 30000,
        netPay: 25650,
        status: 'DRAFT',
      };

      service.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('approve', () => {
    it('should approve a payroll record', async () => {
      const id = 1;

      const expectedResult = {
        id: 1,
        employeeId: 1,
        status: 'APPROVED',
      };

      service.approve.mockResolvedValue(expectedResult);

      const result = await controller.approve(id);

      expect(service.approve).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('markAsPaid', () => {
    it('should mark a payroll record as paid', async () => {
      const id = 1;

      const expectedResult = {
        id: 1,
        employeeId: 1,
        status: 'PAID',
      };

      service.markAsPaid.mockResolvedValue(expectedResult);

      const result = await controller.markAsPaid(id);

      expect(service.markAsPaid).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a payroll record', async () => {
      const id = 1;

      const expectedResult = {
        message: 'Payroll record deleted successfully',
      };

      service.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
