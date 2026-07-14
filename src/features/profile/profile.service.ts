import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  getProfile(username: string) {
    return this.userRepository.findOneBy({
      username: username,
    });
  }

  updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  removeProfile(userId: number) {
    return this.usersService.remove(userId);
  }
}
