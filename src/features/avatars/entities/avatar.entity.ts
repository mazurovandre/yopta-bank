import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@features/users/entities/user.entity';

@Entity()
export class Avatar extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;
}
