import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindUsersQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageFrom: number = 0;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageTo: number = 999;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
