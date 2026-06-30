import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../features/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ username, password }: AuthCredentialsDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.usersService.findOne(username);

    if (user?.password !== password) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = { sub: user.userId, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  signUp(authCredentialsDto: AuthCredentialsDto) {
    return `This action returns all auth ${authCredentialsDto}`;
  }
}
