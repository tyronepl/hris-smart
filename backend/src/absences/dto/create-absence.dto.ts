import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { AbsenceStatus } from '../absence.entity';

export class CreateAbsenceDto {
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  date: string;

  @IsEnum(AbsenceStatus)
  status: AbsenceStatus;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
