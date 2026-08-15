import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Avatar } from '@features/avatars/entities/avatar.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ type: 'varchar', length: 1000 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @OneToMany(() => Avatar, (avatar) => avatar.user)
  avatars: Avatar[];

  avatarsCount?: number;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
