import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from '../features/users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.tdo';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() data: AuthCredentialsDto) {
    return this.authService.login(data);
  }

  @Post('/signup')
  signUp(@Body() data: CreateUserDto) {
    return this.authService.signUp(data);
  }

  @Post('/refresh')
  refreshToken(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data.refresh_token);
  }
}
