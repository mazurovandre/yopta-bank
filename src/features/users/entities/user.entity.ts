import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
