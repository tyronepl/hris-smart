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
  ) {}

  // =========================
  // CREATE EMPLOYEE
  // =========================

  @Post()
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(
      createEmployeeDto,
    );
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
    @UploadedFile() file: any,
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
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.employeesService.findOne(id);
  }

  // =========================
  // UPDATE EMPLOYEE
  // =========================

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(
      id,
      updateEmployeeDto,
    );
  }

  // =========================
  // DELETE EMPLOYEE
  // =========================

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.employeesService.remove(id);
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
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Resume file is required.',
      );
    }

    const resumeText =
      await this.resumeService.extractText(file);

    return this.employeesService.updateResume(
      id,
      file,
      resumeText,
    );
  }
}