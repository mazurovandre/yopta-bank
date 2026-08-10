import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '@features/users/users.service';
import { User } from '@features/users/entities/user.entity';
import { RefreshSession } from './entities/refresh-session.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findOneByUsername: jest.Mock; create: jest.Mock };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let configService: { get: jest.Mock };
  let refreshSessionRepository: {
    update: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
  };

  const mockUser = {
    id: 1,
    username: 'john',
    password: 'hashed-password',
    email: 'john@example.com',
    age: 25,
    description: 'about me',
  } as User;

  const ttlByKey: Record<string, number> = {
    JWT_ACCESS_EXPIRATION_TIME: 54000,
    JWT_REFRESH_EXPIRATION_TIME: 5184000,
  };

  beforeEach(async () => {
    usersService = {
      findOneByUsername: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => ttlByKey[key]),
    };
    refreshSessionRepository = {
      update: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        {
          provide: getRepositoryToken(RefreshSession),
          useValue: refreshSessionRepository,
        },
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

    it('returns a token pair and persists a refresh session on success', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.login({
        username: 'john',
        password: 'secret',
      });

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id, username: mockUser.username, type: 'access' },
        { expiresIn: 54000 },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id, username: mockUser.username, type: 'refresh' },
        { expiresIn: 5184000 },
      );
      expect(refreshSessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: mockUser.id }),
      );
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: expect.any(Date),
      });
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

    it('throws ConflictException when the username is already taken', async () => {
      usersService.findOneByUsername.mockResolvedValue(mockUser);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
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

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: expect.any(Date),
      });
    });
  });

  describe('refreshToken', () => {
    it('propagates UnauthorizedException when the token is invalid/expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(authService.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the payload is not a refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        username: 'john',
        type: 'access',
      });

      await expect(authService.refreshToken('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when no matching session exists', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        username: 'john',
        type: 'refresh',
      });
      refreshSessionRepository.findOneBy.mockResolvedValue(null);

      await expect(authService.refreshToken('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the session was revoked', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        username: 'john',
        type: 'refresh',
      });
      refreshSessionRepository.findOneBy.mockResolvedValue({
        revoked_at: new Date(),
        expires_at: new Date(Date.now() + 10_000),
      });

      await expect(authService.refreshToken('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the session has expired', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        username: 'john',
        type: 'refresh',
      });
      refreshSessionRepository.findOneBy.mockResolvedValue({
        revoked_at: null,
        expires_at: new Date(Date.now() - 1_000),
      });

      await expect(authService.refreshToken('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns a new token pair for a valid refresh session', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        username: 'john',
        type: 'refresh',
      });
      refreshSessionRepository.findOneBy.mockResolvedValue({
        revoked_at: null,
        expires_at: new Date(Date.now() + 10_000),
      });
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await authService.refreshToken('valid-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: expect.any(Date),
      });
    });
  });

  describe('logout', () => {
    it('revokes the active refresh session matching the token', async () => {
      await authService.logout('some-refresh-token');

      expect(refreshSessionRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          refresh_token: expect.any(String),
          revoked_at: expect.anything(),
        }),
        expect.objectContaining({ revoked_at: expect.any(Date) }),
      );
    });
  });
});
