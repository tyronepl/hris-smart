import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import {
  Overtime,
} from './overtime.entity';

import {
  OvertimeController,
} from './overtime.controller';

import {
  OvertimeService,
} from './overtime.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Overtime,
    ]),
  ],
  controllers: [
    OvertimeController,
  ],
  providers: [
    OvertimeService,
  ],
  exports: [
    OvertimeService,
  ],
})
export class OvertimeModule {}
