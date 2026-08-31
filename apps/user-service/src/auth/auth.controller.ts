import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from '@features/users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authorization')
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

  @Post('/logout')
  async logout(@Body() data: RefreshTokenDto) {
    return this.authService.logout(data.refresh_token);
  }
}
