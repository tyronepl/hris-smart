import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

import { LeaveType } from '../leave.entity';

export class CreateLeaveDto {
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsEnum(LeaveType)
  type: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  days: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
