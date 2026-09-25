import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

import { AbsencesService } from './absences.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';

@Controller('absences')
@UseGuards(JwtAuthGuard)
export class AbsencesController {
  constructor(
    private readonly absencesService: AbsencesService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(
    @Body()
    createAbsenceDto: CreateAbsenceDto,
  ) {
    const absence = await this.absencesService.create(
      createAbsenceDto,
    );

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'ABSENCE',
      recordId: absence.id,
      description: `Created absence record for employee ${absence.employeeId}`,
      newData: absence,
    });

    return absence;
  }

  @Get()
  findAll() {
    return this.absencesService.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param(
      'employeeId',
      ParseIntPipe,
    )
    employeeId: number,
  ) {
    return this.absencesService.findByEmployee(
      employeeId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.absencesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateAbsenceDto: UpdateAbsenceDto,
  ) {
    const absence = await this.absencesService.update(
      id,
      updateAbsenceDto,
    );

    await this.auditLogsService.create({
      action: 'UPDATE',
      module: 'ABSENCE',
      recordId: id,
      description: `Updated absence record`,
      newData: absence,
    });

    return absence;
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const result = await this.absencesService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'ABSENCE',
      recordId: id,
      description: `Deleted absence record`,
    });

    return result;
  }
}
