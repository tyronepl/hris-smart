import { IsOptional, IsString } from 'class-validator';

export class ParseResumeDto {
  @IsOptional()
  @IsString()
  text?: string;
}
