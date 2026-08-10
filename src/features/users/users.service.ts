import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { RefreshPasswordDto } from '@features/users/dto/refresh-password.dto';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from '@features/users/repositories/users-repository.interface';
import { Paginated } from '@common/types/paginated.type';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.create(createUserDto);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findOneById(userId: number): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async findAll(query: FindUsersQueryDto): Promise<Paginated<User>> {
    return this.userRepository.findAll(query);
  }

  async refreshPassword(
    userId: number,
    refreshPasswordDto: RefreshPasswordDto,
  ): Promise<User | null> {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException();
    }

    const { currentPassword, newPassword } = refreshPasswordDto;
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new NotFoundException('Wrong password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.userRepository.updatePassword(userId, passwordHash);

    return this.findOneById(userId);
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException();
    }

    await this.userRepository.update(userId, updateUserDto);

    return this.findOneById(userId);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException();
    }

    await this.userRepository.softDelete(id);
  }
}
