import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../features/users/users.service';
import { User } from '../features/users/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findOneByUsername: jest.Mock; create: jest.Mock };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };

  const mockUser = {
    id: 1,
    username: 'john',
    password: 'hashed-password',
    email: 'john@example.com',
    age: 25,
    description: 'about me',
  } as User;

  beforeEach(async () => {
    usersService = {
      findOneByUsername: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findOneByUsername.mockResolvedValue(null);

      await expect(
        authService.login({ username: 'john', password: 'secret' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({ username: 'john', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns an access/refresh token pair on success', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.login({
        username: 'john',
        password: 'secret',
      });

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, username: mockUser.username },
        { expiresIn: '15m' },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id, username: mockUser.username },
        { expiresIn: '7d' },
      );
    });
  });

  describe('signUp', () => {
    const signUpDto = {
      username: 'john',
      password: 'secret',
      email: 'john@example.com',
      age: 25,
      description: 'about me',
    };

    it('throws HttpException(400) when the username is already taken', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        HttpException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('hashes the password and returns tokens on success', async () => {
      usersService.findOneByUsername.mockResolvedValue(null);
      jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.signUp({ ...signUpDto });

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });
  });

  describe('refreshToken', () => {
    it('propagates the error when the token is invalid/expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(authService.refreshToken('bad-token')).rejects.toThrow();
    });

    it('returns a new token pair for a valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 1, username: 'john' });
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await authService.refreshToken('valid-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });
    });
  });
});
