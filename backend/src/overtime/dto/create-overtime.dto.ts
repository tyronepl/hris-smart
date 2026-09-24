import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

import { OvertimeStatus } from '../overtime.entity';

export class CreateOvertimeDto {
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  date: string;

  @Matches(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    {
      message:
        'startTime must be in HH:mm format',
    },
  )
  startTime: string;

  @Matches(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    {
      message:
        'endTime must be in HH:mm format',
    },
  )
  endTime: string;

  @IsNumber()
  @Min(0.01)
  hours: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsEnum(OvertimeStatus)
  @IsOptional()
  status?: OvertimeStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
