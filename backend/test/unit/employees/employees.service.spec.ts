import { jest } from '@jest/globals';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmployeesService } from '../../../src/employees/employees.service';
import { Employee } from '../../../src/employees/entities/employee.entity';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const repository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          EmployeesService,
          {
            provide: getRepositoryToken(Employee),
            useValue: repository,
          },
        ],
      }).compile();

    service =
      module.get<EmployeesService>(
        EmployeesService,
      );
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create an employee', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const employee = {
        id: 1,
        ...dto,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(employee);
      repository.save.mockResolvedValue(employee);

      const result = await service.create(dto as any);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          email: dto.email,
        },
      });

      expect(repository.create).toHaveBeenCalledWith(dto);

      expect(repository.save).toHaveBeenCalledWith(
        employee,
      );

      expect(result).toEqual(employee);
    });

    it('should reject duplicate email', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      repository.findOne.mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(
        service.create(dto as any),
      ).rejects.toThrow(BadRequestException);

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      const employees = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
        },
      ];

      repository.find.mockResolvedValue(employees);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual(employees);
    });
  });

  describe('findOne', () => {
    it('should return an employee', async () => {
      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      };

      repository.findOne.mockResolvedValue(employee);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(employee);
    });

    it('should throw NotFoundException when employee does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const dto = {
        firstName: 'Johnny',
        lastName: 'Doe',
      };

      repository.findOne.mockResolvedValue(employee);

      repository.save.mockResolvedValue({
        ...employee,
        ...dto,
      });

      const result = await service.update(
        1,
        dto as any,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(repository.save).toHaveBeenCalledWith(
        employee,
      );

      expect(result).toEqual({
        ...employee,
        ...dto,
      });
    });

    it('should reject duplicate email when updating', async () => {
      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const existingEmployee = {
        id: 2,
        email: 'jane@example.com',
      };

      repository.findOne
        .mockResolvedValueOnce(employee)
        .mockResolvedValueOnce(existingEmployee);

      await expect(
        service.update(
          1,
          {
            email: 'jane@example.com',
          } as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw when updating a non-existent employee', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          999,
          {
            firstName: 'John',
          } as any,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an employee', async () => {
      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      };

      repository.findOne.mockResolvedValue(employee);
      repository.remove.mockResolvedValue(employee);

      const result = await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(
        employee,
      );

      expect(result).toEqual({
        message: 'Employee deleted successfully',
      });
    });

    it('should throw when deleting a non-existent employee', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(999),
      ).rejects.toThrow(NotFoundException);

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('updateResume', () => {
    it('should update employee resume information', async () => {
      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      };

      const file = {
        originalname: 'john-resume.pdf',
        path: 'uploads/resumes/john-resume.pdf',
      };

      const resumeText =
        'John Doe PHP Laravel Developer';

      repository.findOne.mockResolvedValue(employee);

      repository.save.mockResolvedValue({
        ...employee,
        resumeOriginalName: file.originalname,
        resumePath: file.path,
        resumeText,
      });

      const result =
        await service.updateResume(
          1,
          file,
          resumeText,
        );

      expect(employee.resumeOriginalName).toBe(
        file.originalname,
      );

      expect(employee.resumePath).toBe(
        file.path,
      );

      expect(employee.resumeText).toBe(
        resumeText,
      );

      expect(repository.save).toHaveBeenCalledWith(
        employee,
      );

      expect(result).toEqual({
        ...employee,
        resumeOriginalName: file.originalname,
        resumePath: file.path,
        resumeText,
      });
    });

    it('should throw when employee does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateResume(
          999,
          {
            originalname: 'resume.pdf',
            path: 'uploads/resume.pdf',
          },
          'Resume text',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
