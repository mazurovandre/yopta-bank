import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { User } from '@features/users/entities/user.entity';
import { CreateUserDto } from '@features/users/dto/create-user.dto';
import { UpdateUserDto } from '@features/users/dto/update-user.dto';
import { FindUsersQueryDto } from '@features/users/dto/find-users-query.dto';
import { Paginated } from '@common/types/paginated.type';
import { IUsersRepository } from './users-repository.interface';
import { FindMostActiveQueryDto } from '@features/users/dto/find-most-active-query.dto';
import { Avatar } from '@features/avatars/entities/avatar.entity';

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

  async findMostActive(
    query: FindMostActiveQueryDto,
  ): Promise<Paginated<User>> {
    const {
      page,
      limit,
      minAvatars = 2,
      username,
      email,
      ageFrom,
      ageTo,
    } = query;

    const qb = this.repo.createQueryBuilder('user');

    const avatarsCount = qb
      .subQuery()
      .select('COUNT(*)')
      .from(Avatar, 'avatar')
      .where('avatar.user_id = user.id')
      .andWhere('avatar.deleted_at IS NULL')
      .getQuery();

    qb.where('user.age BETWEEN :ageFrom AND :ageTo', { ageFrom, ageTo });

    if (username) {
      qb.andWhere('user.username ILIKE :username', {
        username: `%${username}%`,
      });
    }
    if (email) {
      qb.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    qb.andWhere(`${avatarsCount} >= :minAvatars`, { minAvatars });

    const total = await qb.clone().getCount();

    const { entities, raw } = await qb
      .addSelect(avatarsCount, 'avatars_count')
      .orderBy('avatars_count', 'DESC')
      .addOrderBy('user.id', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawAndEntities();

    const items = entities.map((user, index) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.assign(user, { avatarsCount: Number(raw[index].avatars_count) }),
    );

    return { items, total, limit, page };
  }

  async debit(id: number, amount: number): Promise<boolean> {
    const result = await this.repo.decrement(
      {
        id,
        balance: MoreThanOrEqual(amount),
      },
      'balance',
      amount,
    );

    return result.affected === 1;
  }

  async credit(id: number, amount: number): Promise<void> {
    await this.repo.increment({ id }, 'balance', amount);
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

  async resetAllBalances(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(User)
      .set({ balance: 0 })
      .where('balance <> 0')
      .execute();

    return result.affected ?? 0;
  }
}
