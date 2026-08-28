import { Injectable } from '@nestjs/common';
import { IAvatarsRepository } from '@features/avatars/repositories/avatars.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Avatar } from '@features/avatars/entities/avatar.entity';

@Injectable()
export class TypeOrmAvatarsRepository implements IAvatarsRepository {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly dataSource: DataSource,
  ) {}

  countActiveByUserId(userId: number): Promise<number> {
    return this.avatarRepository.count({ where: { user_id: userId } });
  }

  async create(
    userId: number,
    filename: string,
    limit: number,
  ): Promise<Avatar | null> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1)', [userId]);

      const count = await manager.count(Avatar, { where: { user_id: userId } });
      if (count >= limit) {
        return null;
      }

      return manager.save(
        Avatar,
        manager.create(Avatar, { user_id: userId, filename }),
      );
    });
  }

  findActiveByIdAndUserId(id: number, userId: number): Promise<Avatar | null> {
    return this.avatarRepository.findOne({ where: { id, user_id: userId } });
  }

  async softDelete(id: number): Promise<void> {
    await this.avatarRepository.softDelete(id);
  }
}
