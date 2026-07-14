import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileService } from './profile.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let userRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

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
      findOneBy: jest.fn(),
    };
    usersService = {
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    profileService = module.get(ProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('looks the user up by username', async () => {
      userRepository.findOneBy!.mockResolvedValue(mockUser);

      const result = await profileService.getProfile('john');

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        username: 'john',
      });
      expect(result).toEqual(mockUser);
    });

    it('returns null when no user matches the username', async () => {
      userRepository.findOneBy!.mockResolvedValue(null);

      const result = await profileService.getProfile('ghost');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('delegates to UsersService.update with the given user id', async () => {
      usersService.update!.mockResolvedValue(mockUser);

      const result = await profileService.updateProfile(1, {
        description: 'updated',
      });

      expect(usersService.update).toHaveBeenCalledWith(1, {
        description: 'updated',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('removeProfile', () => {
    it('delegates to UsersService.remove with the given user id', async () => {
      await profileService.removeProfile(1);

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
