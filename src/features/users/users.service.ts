import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { FindMostActiveQueryDto } from '@features/users/dto/find-most-active-query.dto';
import { TransferBalanceDto } from './dto/transfer-balance.dto';
import { runOnTransactionCommit, Transactional } from 'typeorm-transactional';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUsersRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  async findMostActive(
    query: FindMostActiveQueryDto,
  ): Promise<Paginated<User>> {
    return this.userRepository.findMostActive(query);
  }

  @Transactional()
  async transferBalance(
    userId: number,
    sendMoneyDto: TransferBalanceDto,
  ): Promise<void> {
    const sender = await this.findOneById(userId);
    const { amount, recipientId } = sendMoneyDto;

    if (userId === recipientId) {
      throw new BadRequestException('Not allowed to send money to yourself');
    }

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    if (sender?.balance < amount) {
      throw new BadRequestException('Not enough money');
    }

    const recipient = await this.findOneById(recipientId);

    if (!recipient) {
      throw new NotFoundException();
    }

    const isDebited = await this.userRepository.debit(userId, amount);

    if (!isDebited) {
      throw new BadRequestException('Not enough money');
    }

    await this.userRepository.credit(recipientId, amount);

    runOnTransactionCommit(() => {
      void this.cacheManager.mdel([
        `/users/${userId}`,
        `/users/${recipientId}`,
      ]);
    });
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

  async resetAllBalances(): Promise<number> {
    return await this.userRepository.resetAllBalances();
  }
}
