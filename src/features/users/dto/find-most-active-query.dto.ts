import { FindUsersQueryDto } from '@features/users/dto/find-users-query.dto';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindMostActiveQueryDto extends FindUsersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minAvatars?: number;
}
