import { CreateUserDto } from '@features/users/dto/create-user.dto';
import { User } from '@features/users/entities/user.entity';
import { FindUsersQueryDto } from '@features/users/dto/find-users-query.dto';
import { Paginated } from '@common/types/paginated.type';
import { UpdateUserDto } from '@features/users/dto/update-user.dto';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface IUsersRepository {
  create(data: CreateUserDto): Promise<User>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findAll(query: FindUsersQueryDto): Promise<Paginated<User>>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  update(id: number, data: UpdateUserDto): Promise<void>;
  softDelete(id: number): Promise<void>;
}
