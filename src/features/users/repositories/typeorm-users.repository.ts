import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { User } from '@features/users/entities/user.entity';
import { CreateUserDto } from '@features/users/dto/create-user.dto';
import { UpdateUserDto } from '@features/users/dto/update-user.dto';
import { FindUsersQueryDto } from '@features/users/dto/find-users-query.dto';
import { Paginated } from '@common/types/paginated.type';
import { IUsersRepository } from './users-repository.interface';

@Injectable()
export class TypeOrmUsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(data: CreateUserDto): Promise<User> {
    const user = this.repo.create(data);

    return this.repo.save(user);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(query: FindUsersQueryDto): Promise<Paginated<User>> {
    const { page, limit, ageFrom, ageTo, username, email } = query;
    const where: FindOptionsWhere<User> = {
      age: Between(ageFrom, ageTo),
    };

    if (username) {
      where.username = ILike(`%${username}%`);
    }
    if (email) {
      where.email = ILike(`%${email}%`);
    }

    const result = await paginate<User>(this.repo, { page, limit }, { where });

    return {
      items: result.items,
      total: result.meta.totalItems ?? 0,
      page: result.meta.currentPage,
      limit: result.meta.itemsPerPage,
    };
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.repo.update(id, { password: passwordHash });
  }

  async update(id: number, data: UpdateUserDto): Promise<void> {
    await this.repo.update(id, data);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
