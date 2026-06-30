import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    return this.userRepository.save(user);
  }

  async findOne(userId: number): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: { id: userId },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(userId, updateUserDto);

    return this.findOne(userId);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}
