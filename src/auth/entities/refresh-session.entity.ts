import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsHash, IsUUID } from 'class-validator';
import { User } from '@features/users/entities/user.entity';

@Entity()
export class RefreshSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @Index()
  user_id: number;

  @Column()
  @IsHash('sha256')
  refresh_token: string;

  @IsUUID()
  @Index()
  family_id: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
