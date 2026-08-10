import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { RefreshPasswordDto } from './dto/refresh-password.dto';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './repositories/users-repository.interface';
import { Paginated } from '@common/types/paginated.type';

jest.mock('bcrypt');

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: jest.Mocked<IUsersRepository>;

  const mockUser = {
    id: 1,
    username: 'john',
    password: 'hashed-password',
    email: 'john@example.com',
    age: 25,
    description: 'about me',
  } as User;

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updatePassword: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: usersRepository },
      ],
    }).compile();

    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('delegates creation to the repository', async () => {
      const createUserDto: CreateUserDto = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
        age: 25,
        description: 'about me',
      };
      usersRepository.create.mockResolvedValue(mockUser);

      const result = await usersService.create(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByUsername', () => {
    it('looks the user up by username', async () => {
      usersRepository.findByUsername.mockResolvedValue(mockUser);

      const result = await usersService.findOneByUsername('john');

      expect(usersRepository.findByUsername).toHaveBeenCalledWith('john');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneById', () => {
    it('looks the user up by id', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);

      const result = await usersService.findOneById(1);

      expect(usersRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('delegates pagination to the repository', async () => {
      const query: FindUsersQueryDto = {
        page: 1,
        limit: 10,
        ageFrom: 0,
        ageTo: 999,
      };
      const paginated: Paginated<User> = {
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
      };
      usersRepository.findAll.mockResolvedValue(paginated);

      const result = await usersService.findAll(query);

      expect(usersRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('refreshPassword', () => {
    const refreshPasswordDto: RefreshPasswordDto = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
    };

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(
        usersService.refreshPassword(1, refreshPasswordDto),
      ).rejects.toThrow(NotFoundException);
      expect(usersRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the current password does not match', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        usersService.refreshPassword(1, refreshPasswordDto),
      ).rejects.toThrow(NotFoundException);
      expect(usersRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('hashes and saves the new password when the current password matches', async () => {
      const updatedUser = { ...mockUser, password: 'new-hash' } as User;
      usersRepository.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jest.mocked(bcrypt.hash).mockResolvedValue('new-hash' as never);

      const result = await usersService.refreshPassword(1, refreshPasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 12);
      expect(usersRepository.updatePassword).toHaveBeenCalledWith(1, 'new-hash');
      expect(result).toEqual(updatedUser);
    });
  });

  describe('update', () => {
    it('updates the user and returns the fresh record', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue(undefined);

      const result = await usersService.update(1, { description: 'new bio' });

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        description: 'new bio',
      });
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(
        usersService.update(1, { description: 'new bio' }),
      ).rejects.toThrow(NotFoundException);
      expect(usersRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft-deletes the user instead of a hard delete', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);

      await usersService.remove(1);

      expect(usersRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(usersService.remove(1)).rejects.toThrow(NotFoundException);
      expect(usersRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
