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
  AbsencesService,
} from './absences.service';

import {
  CreateAbsenceDto,
} from './dto/create-absence.dto';

import {
  UpdateAbsenceDto,
} from './dto/update-absence.dto';

@Controller('absences')
@UseGuards(JwtAuthGuard)
export class AbsencesController {
  constructor(
    private readonly absencesService: AbsencesService,
  ) {}

  @Post()
  create(
    @Body()
    createAbsenceDto: CreateAbsenceDto,
  ) {
    return this.absencesService.create(
      createAbsenceDto,
    );
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
    return this.absencesService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateAbsenceDto: UpdateAbsenceDto,
  ) {
    return this.absencesService.update(
      id,
      updateAbsenceDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.absencesService.remove(id);
  }
}
