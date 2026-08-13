import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@features/users/entities/user.entity';

@Entity()
export class Avatar extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  updated_at: Date;
}
