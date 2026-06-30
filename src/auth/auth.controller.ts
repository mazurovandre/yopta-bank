import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() credentialsDto: AuthCredentialsDto) {
    return this.authService.login(credentialsDto);
  }

  @Post('/signup')
  signUp(@Body() credentialsDto: AuthCredentialsDto) {
    return this.authService.signUp(credentialsDto);
  }
}
