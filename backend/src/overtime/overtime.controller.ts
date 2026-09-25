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

import {
  OvertimeService,
} from './overtime.service';

import {
  CreateOvertimeDto,
} from './dto/create-overtime.dto';

import {
  UpdateOvertimeDto,
} from './dto/update-overtime.dto';

import {
  UpdateOvertimeStatusDto,
} from './dto/update-overtime-status.dto';

@Controller('overtime')
@UseGuards(JwtAuthGuard)
export class OvertimeController {
  constructor(
    private readonly overtimeService: OvertimeService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(
    @Body()
    createOvertimeDto: CreateOvertimeDto,
  ) {
    const overtime =
      await this.overtimeService.create(
        createOvertimeDto,
      );

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'OVERTIME',
      recordId: overtime.id,
      description: `Created overtime record #${overtime.id} for employee ${overtime.employeeId}`,
      newData: overtime,
    });

    return overtime;
  }

  @Get()
  findAll() {
    return this.overtimeService.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param(
      'employeeId',
      ParseIntPipe,
    )
    employeeId: number,
  ) {
    return this.overtimeService.findByEmployee(
      employeeId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.overtimeService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateOvertimeDto: UpdateOvertimeDto,
  ) {
    const overtime =
      await this.overtimeService.update(
        id,
        updateOvertimeDto,
      );

    await this.auditLogsService.create({
      action: 'UPDATE',
      module: 'OVERTIME',
      recordId: id,
      description: `Updated overtime record`,
      newData: overtime,
    });

    return overtime;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateStatusDto: UpdateOvertimeStatusDto,
  ) {
    const overtime =
      await this.overtimeService.updateStatus(
        id,
        updateStatusDto,
      );

    const status =
      updateStatusDto.status?.toUpperCase();

    let action = 'UPDATE';

    if (status === 'APPROVED') {
      action = 'APPROVE';
    } else if (status === 'REJECTED') {
      action = 'REJECT';
    }

    await this.auditLogsService.create({
      action,
      module: 'OVERTIME',
      recordId: id,
      description:
        `Changed overtime record status to ${status}`,
      newData: overtime,
    });

    return overtime;
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const result =
      await this.overtimeService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'OVERTIME',
      recordId: id,
      description: `Deleted overtime record`,
    });

    return result;
  }
}
