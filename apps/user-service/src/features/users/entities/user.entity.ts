import {
  BaseEntity,
  Check,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Avatar } from '@features/avatars/entities/avatar.entity';

@Check('"balance" >= 0')
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

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to(value: number) {
        return value;
      },
      from(value: number | null) {
        return value === null ? null : Number(value);
      },
    },
  })
  balance: number;

  @OneToMany(() => Avatar, (avatar) => avatar.user)
  avatars: Avatar[];

  avatarsCount?: number;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
