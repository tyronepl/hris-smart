import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  IsNumber,
} from 'class-validator';

import { AttendanceStatus } from '../attendance.entity';

export class CreateAttendanceDto {
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'clockIn must be in HH:mm format',
  })
  clockIn?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'clockOut must be in HH:mm format',
  })
  clockOut?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursWorked?: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
