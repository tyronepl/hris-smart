import { jest } from '@jest/globals';
import {
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmployeesController } from '../../../src/employees/employees.controller';
import { EmployeesService } from '../../../src/employees/employees.service';
import { ResumeService } from '../../../src/employees/resume.service';
import { JwtAuthGuard } from '../../../src/auth/jwt-auth.guard';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const employeesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateResume: jest.fn(),
  };

  const resumeService = {
    extractText: jest.fn(),
    parseResumeWithAI: jest.fn(),
  };

  const mockJwtAuthGuard: CanActivate = {
    canActivate: (
      _context: ExecutionContext,
    ) => true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          EmployeesController,
        ],
        providers: [
          {
            provide: EmployeesService,
            useValue: employeesService,
          },
          {
            provide: ResumeService,
            useValue: resumeService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(mockJwtAuthGuard)
        .compile();

    controller =
      module.get<EmployeesController>(
        EmployeesController,
      );
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const employee = {
        id: 1,
        ...dto,
      };

      employeesService.create.mockResolvedValue(
        employee,
      );

      const result =
        await controller.create(dto as any);

      expect(
        employeesService.create,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(employee);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const employees = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
      ];

      employeesService.findAll.mockResolvedValue(
        employees,
      );

      const result =
        await controller.findAll();

      expect(
        employeesService.findAll,
      ).toHaveBeenCalled();

      expect(result).toEqual(employees);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      };

      employeesService.findOne.mockResolvedValue(
        employee,
      );

      const result =
        await controller.findOne(1);

      expect(
        employeesService.findOne,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(employee);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = {
        firstName: 'Johnny',
      };

      const employee = {
        id: 1,
        firstName: 'Johnny',
      };

      employeesService.update.mockResolvedValue(
        employee,
      );

      const result =
        await controller.update(
          1,
          dto as any,
        );

      expect(
        employeesService.update,
      ).toHaveBeenCalledWith(
        1,
        dto,
      );

      expect(result).toEqual(employee);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const response = {
        message:
          'Employee deleted successfully',
      };

      employeesService.remove.mockResolvedValue(
        response,
      );

      const result =
        await controller.remove(1);

      expect(
        employeesService.remove,
      ).toHaveBeenCalledWith(1);

      expect(result).toEqual(response);
    });
  });

  describe('uploadResume', () => {
    it('should extract resume text and update employee resume', async () => {
      const file = {
        originalname: 'john-resume.pdf',
        path: 'uploads/resumes/john-resume.pdf',
      };

      const resumeText =
        'John Doe PHP Laravel Developer';

      const employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        resumeText,
      };

      resumeService.extractText.mockResolvedValue(
        resumeText,
      );

      employeesService.updateResume.mockResolvedValue(
        employee,
      );

      const result =
        await controller.uploadResume(
          1,
          file,
        );

      expect(
        resumeService.extractText,
      ).toHaveBeenCalledWith(file);

      expect(
        employeesService.updateResume,
      ).toHaveBeenCalledWith(
        1,
        file,
        resumeText,
      );

      expect(result).toEqual(employee);
    });
  });

  describe('parseResume', () => {
    it('should parse resume using AI', async () => {
      const file = {
        originalname: 'john-resume.pdf',
        mimetype: 'application/pdf',
        path: 'uploads/resumes/john-resume.pdf',
      };

      const parsedResume = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        skills: [
          'PHP',
          'Laravel',
          'Vue.js',
        ],
      };

      resumeService.parseResumeWithAI.mockResolvedValue(
        parsedResume,
      );

      const result =
        await controller.parseResume(file);

      expect(
        resumeService.parseResumeWithAI,
      ).toHaveBeenCalledWith(file);

      expect(result).toEqual(
        parsedResume,
      );
    });
  });
});