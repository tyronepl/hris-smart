import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  AuditLogsService,
} from './audit-logs.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  async findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.auditLogsService.findOne(id);
  }
}
