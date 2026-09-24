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
  ) {}

  @Post()
  create(
    @Body()
    createOvertimeDto: CreateOvertimeDto,
  ) {
    return this.overtimeService.create(
      createOvertimeDto,
    );
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
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateOvertimeDto: UpdateOvertimeDto,
  ) {
    return this.overtimeService.update(
      id,
      updateOvertimeDto,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateStatusDto: UpdateOvertimeStatusDto,
  ) {
    return this.overtimeService.updateStatus(
      id,
      updateStatusDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.overtimeService.remove(id);
  }
}
