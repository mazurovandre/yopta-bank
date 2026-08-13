import { Injectable } from '@nestjs/common';
import { IAvatarsRepository } from '@features/avatars/repositories/avatars.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from '@features/avatars/entities/avatar.entity';

@Injectable()
export class TypeOrmAvatarsRepository implements IAvatarsRepository {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
  ) {}

  countActiveByUserId(userId: number): Promise<number> {
    return this.avatarRepository.count({ where: { user_id: userId } });
  }

  create(userId: number, filename: string): Promise<Avatar> {
    const avatar = this.avatarRepository.create({
      user_id: userId,
      filename,
    });

    return this.avatarRepository.save(avatar);
  }

  findActiveByIdAndUserId(id: number, userId: number): Promise<Avatar | null> {
    return this.avatarRepository.findOne({ where: { id, user_id: userId } });
  }

  async softDelete(id: number): Promise<void> {
    await this.avatarRepository.softDelete(id);
  }
}
