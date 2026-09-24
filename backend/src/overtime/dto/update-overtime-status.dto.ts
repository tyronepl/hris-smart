import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { OvertimeStatus } from '../overtime.entity';

export class UpdateOvertimeStatusDto {
  @IsEnum(OvertimeStatus)
  status: OvertimeStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
