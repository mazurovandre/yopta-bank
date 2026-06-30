import * as bcrypt from 'bcrypt';

import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../features/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { CreateUserDto } from '../features/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ username, password }: AuthCredentialsDto) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return this.generateToken(user.id, username);
  }

  async signUp(data: CreateUserDto) {
    const user = await this.usersService.findOneByUsername(data.username);

    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    data.password = await bcrypt.hash(data.password, 10);

    const { id, username } = await this.usersService.create(data);

    return this.generateToken(id, username);
  }

  generateToken(id: number, username: string) {
    const payload: JwtPayload = { sub: id, username };

    return {
      access_token: this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    };
  }

  refreshToken(token: string) {
    const payload = this.jwtService.verifyAsync(token);

    return {
      access_token: this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    };
  }
}
