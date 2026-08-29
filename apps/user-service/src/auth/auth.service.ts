import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '@features/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { CreateUserDto } from '@features/users/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RefreshSession } from './entities/refresh-session.entity';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshSession)
    private readonly refreshSessionRepository: Repository<RefreshSession>,
  ) {}

  async login({ username, password }: AuthCredentialsDto) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      this.logger.warn(`Login failed: user "${username}" not found`);
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      this.logger.warn(`Login failed: wrong password for user "${username}"`);
      throw new UnauthorizedException();
    }

    this.logger.log(`Login successful for user id=${user.id}`);

    return this.generateToken(user.id, username);
  }

  async signUp(data: CreateUserDto) {
    const { username, password } = data;
    const user = await this.usersService.findOneByUsername(username);

    if (user) {
      this.logger.warn(`Sign up failed: username "${username}" already taken`);
      throw new ConflictException('User already exists');
    }

    const newPassword = await bcrypt.hash(password, 12);

    const { id, username: newUser } = await this.usersService.create({
      ...data,
      password: newPassword,
    });

    this.logger.log(`Sign up successful: user "${newUser}" id=${id} created`);

    return this.generateToken(id, newUser);
  }

  async generateToken(id: number, username: string) {
    const accessTTL = Number(
      this.configService.get<number>('JWT_ACCESS_EXPIRATION_TIME') ?? 54000,
    );
    const refreshTTL = Number(
      this.configService.get<number>('JWT_REFRESH_EXPIRATION_TIME') ?? 5184000,
    );
    const accessToken = await this.jwtService.signAsync(
      { sub: id, username, type: 'access' },
      { expiresIn: accessTTL },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: id, username, type: 'refresh' },
      { expiresIn: refreshTTL },
    );

    const expiresAt = new Date(Date.now() + refreshTTL);

    await this.refreshSessionRepository.update(
      {
        user_id: id,
        revoked_at: IsNull(),
      },
      { revoked_at: new Date() },
    );

    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.refreshSessionRepository.save({
      user_id: id,
      refresh_token: refreshTokenHash,
      expires_at: expiresAt,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    };
  }

  async refreshToken(token: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (error) {
      this.logger.warn('Refresh failed: token is invalid or expired');
      throw new UnauthorizedException(error);
    }

    if (payload.type !== 'refresh') {
      this.logger.warn(
        `Refresh failed: wrong token type "${payload.type}" for user id=${payload.sub}`,
      );
      throw new UnauthorizedException();
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await this.refreshSessionRepository.findOneBy({
      user_id: payload.sub,
      refresh_token: tokenHash,
    });

    if (!session) {
      this.logger.warn(
        `Refresh failed: session not found for user id=${payload.sub}`,
      );
      throw new UnauthorizedException();
    }

    if (session.revoked_at) {
      this.logger.error(
        `Refresh rejected: revoked token reused for user id=${payload.sub}`,
      );
      throw new UnauthorizedException();
    }

    if (session.expires_at < new Date()) {
      this.logger.warn(
        `Refresh failed: session expired for user id=${payload.sub}`,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(`Refresh successful for user id=${payload.sub}`);

    return this.generateToken(payload.sub, payload.username);
  }

  async logout(token: string): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.refreshSessionRepository.update(
      {
        refresh_token: tokenHash,
        revoked_at: IsNull(),
      },
      { revoked_at: new Date() },
    );

    this.logger.log('Logout: refresh session revoked');
  }
}
