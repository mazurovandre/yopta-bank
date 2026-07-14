import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  const mockUser = {
    id: 1,
    username: 'john',
    password: 'hashed-password',
    email: 'john@example.com',
    age: 25,
    description: 'about me',
  } as User;

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and saves a new user', async () => {
      const createUserDto = {
        username: 'john',
        password: 'secret',
        email: 'john@example.com',
        age: 25,
        description: 'about me',
      };
      userRepository.create!.mockReturnValue(mockUser);
      userRepository.save!.mockResolvedValue(mockUser);

      const result = await usersService.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByUsername', () => {
    it('looks the user up by username', async () => {
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await usersService.findOneByUsername('john');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'john' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneById', () => {
    it('looks the user up by id', async () => {
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await usersService.findOneById(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('paginates with just the age range when no search terms are given', async () => {
      jest.mocked(paginate).mockResolvedValue('paginated-result' as never);

      const result = await usersService.findAll({ page: 1, limit: 10 }, 0, 999);

      expect(paginate).toHaveBeenCalledWith(
        userRepository,
        { page: 1, limit: 10 },
        { where: { age: Between(0, 999) } },
      );
      expect(result).toBe('paginated-result');
    });

    it('adds a username filter with ILike when username is provided', async () => {
      jest.mocked(paginate).mockResolvedValue('paginated-result' as never);

      await usersService.findAll({ page: 1, limit: 10 }, 0, 999, 'jo');

      expect(paginate).toHaveBeenCalledWith(
        userRepository,
        { page: 1, limit: 10 },
        { where: { age: Between(0, 999), username: ILike('%jo%') } },
      );
    });

    it('adds an email filter with ILike when email is provided', async () => {
      jest.mocked(paginate).mockResolvedValue('paginated-result' as never);

      await usersService.findAll(
        { page: 1, limit: 10 },
        0,
        999,
        undefined,
        'john@',
      );

      expect(paginate).toHaveBeenCalledWith(
        userRepository,
        { page: 1, limit: 10 },
        { where: { age: Between(0, 999), email: ILike('%john@%') } },
      );
    });
  });

  describe('update', () => {
    it('updates the user and returns the fresh record', async () => {
      userRepository.update!.mockResolvedValue(undefined);
      userRepository.findOne!.mockResolvedValue(mockUser);

      const result = await usersService.update(1, { description: 'new bio' });

      expect(userRepository.update).toHaveBeenCalledWith(1, {
        description: 'new bio',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('soft-deletes the user instead of a hard delete', async () => {
      userRepository.softDelete!.mockResolvedValue(undefined);

      await usersService.remove(1);

      expect(userRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
