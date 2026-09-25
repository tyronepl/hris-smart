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

import { LeavesService } from './leaves.service';

import { CreateLeaveDto } from './dto/create-leave.dto';

import {
  UpdateLeaveStatusDto,
} from './dto/update-leave-status.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(
    private readonly leavesService: LeavesService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Post()
  async create(
    @Body()
    createLeaveDto: CreateLeaveDto,
  ) {
    const leave =
      await this.leavesService.create(
        createLeaveDto,
      );

    await this.auditLogsService.create({
      action: 'CREATE',
      module: 'LEAVE',
      recordId: leave.id,
      description: `Created leave request #${leave.id} for employee ${leave.employeeId}`,
      newData: leave,
    });

    return leave;
  }

  @Get()
  findAll() {
    return this.leavesService.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(
    @Param(
      'employeeId',
      ParseIntPipe,
    )
    employeeId: number,
  ) {
    return this.leavesService.findByEmployee(
      employeeId,
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.leavesService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateLeaveStatusDto: UpdateLeaveStatusDto,
  ) {
    const leave =
      await this.leavesService.updateStatus(
        id,
        updateLeaveStatusDto,
      );

    const status =
      updateLeaveStatusDto.status?.toUpperCase();

    let action = 'UPDATE';

    if (status === 'APPROVED') {
      action = 'APPROVE';
    } else if (status === 'REJECTED') {
      action = 'REJECT';
    }

    await this.auditLogsService.create({
      action,
      module: 'LEAVE',
      recordId: id,
      description:
        `Changed leave request #${id} status to ${status}`,
      newData: leave,
    });

    return leave;
  }

  @Patch(':id/cancel')
  async cancel(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const leave =
      await this.leavesService.cancel(id);

    await this.auditLogsService.create({
      action: 'CANCEL',
      module: 'LEAVE',
      recordId: id,
      description: `Cancelled leave request #${id}`,
      newData: leave,
    });

    return leave;
  }

  @Delete(':id')
  async remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    const result =
      await this.leavesService.remove(id);

    await this.auditLogsService.create({
      action: 'DELETE',
      module: 'LEAVE',
      recordId: id,
      description: `Deleted leave request #${id}`,
    });

    return result;
  }
}
