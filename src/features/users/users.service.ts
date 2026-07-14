import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username: username },
    });
  }

  async findOneById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async findAll(
    options: IPaginationOptions,
    username: string | undefined,
    ageFrom: number,
    ageTo: number,
    email: string | undefined,
  ): Promise<Pagination<User>> {
    const where: FindOptionsWhere<User> = {
      age: Between(ageFrom, ageTo),
    };

    if (username) {
      where.username = ILike(`%${username}%`);
    }

    if (email) {
      where.email = ILike(`%${email}%`);
    }

    return paginate<User>(this.userRepository, options, { where });
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    await this.userRepository.update(userId, updateUserDto);

    return this.findOneById(userId);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}
