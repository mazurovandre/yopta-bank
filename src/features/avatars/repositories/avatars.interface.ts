import { Avatar } from '@features/avatars/entities/avatar.entity';

export const AVATARS_REPOSITORY = Symbol('AVATARS_REPOSITORY');

export interface IAvatarsRepository {
  countActiveByUserId(userId: number): Promise<number>;
  create(
    userId: number,
    filename: string,
    limit: number,
  ): Promise<Avatar | null>;
  findActiveByIdAndUserId(id: number, userId: number): Promise<Avatar | null>;
  softDelete(id: number): Promise<void>;
}
