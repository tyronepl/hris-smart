import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import {
  Absence,
} from './absence.entity';

import {
  AbsencesController,
} from './absences.controller';

import {
  AbsencesService,
} from './absences.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Absence,
    ]),
  ],
  controllers: [
    AbsencesController,
  ],
  providers: [
    AbsencesService,
  ],
  exports: [
    AbsencesService,
  ],
})
export class AbsencesModule {}
