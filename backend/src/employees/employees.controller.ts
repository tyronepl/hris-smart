import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';
import { ResumeService } from './resume.service';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly resumeService: ResumeService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // =========================
  // CREATE EMPLOYEE
  // =========================

  @Post()
  async create(
    @Body()
    createEmployeeDto: CreateEmployeeDto,
  ) {
    const employee =
      await this.employeesService.create(
        createEmployeeDto,
      );

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'EMPLOYEE',
      recordId: employee.id,
      description:
        `Created employee ${employee.firstName} ${employee.lastName}`,
      newData: employee,
    });

    return employee;
  }

  // =========================
  // GET ALL EMPLOYEES
  // =========================

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // =========================
  // AI RESUME PARSING
  // =========================

  @Post('resume/parse')
  @UseInterceptors(
    FileInterceptor('resume', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only PDF and DOCX files are supported for AI parsing.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async parseResume(
    @UploadedFile()
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Resume file is required.',
      );
    }

    return this.resumeService.parseResumeWithAI(
      file,
    );
  }

  // =========================
  // GET SINGLE EMPLOYEE
  // =========================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.findOne(id);
  }

  // =========================
  // UPDATE EMPLOYEE
  // =========================

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee =
      await this.employeesService.update(
        id,
        updateEmployeeDto,
      );

    await this.auditLogsService.create({
      action: 'UPDATE',
      module: 'EMPLOYEE',
      recordId: id,
      description:
        `Updated employee record`,
      newData: employee,
    });

    return employee;
  }

  // =========================
  // DELETE EMPLOYEE
  // =========================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const result =
      await this.employeesService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'EMPLOYEE',
      recordId: id,
      description:
        `Deleted employee record`,
    });

    return result;
  }

  // =========================
  // UPLOAD / SAVE RESUME
  // =========================

  @Post(':id/resume')
  @UseInterceptors(
    FileInterceptor('resume', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only PDF and DOCX files are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadResume(
    @Param('id', ParseIntPipe)
    id: number,

    @UploadedFile()
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Resume file is required.',
      );
    }

    const resumeText =
      await this.resumeService.extractText(file);

    const employee =
      await this.employeesService.updateResume(
        id,
        file,
        resumeText,
      );

    await this.auditLogsService.create({
      action: 'RESUME_UPLOAD',
      module: 'EMPLOYEE',
      recordId: id,
      description:
        `Uploaded resume for employee #${id}`,
      newData: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });

    return employee;
  }
}
