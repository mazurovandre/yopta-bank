import { Request } from 'express';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/my')
  findAll(@Req() request: Request) {
    const username = request['user']['username'];

    return this.profileService.getProfile(username);
  }
}
