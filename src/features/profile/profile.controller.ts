import { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '@features/users/dto/update-user.dto';

@ApiTags('Current user info')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async findAll(@Req() request: Request) {
    const username = request['user']['username'];
    const user = await this.profileService.getProfile(username);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Patch()
  update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = request['user']['sub'];

    return this.profileService.updateProfile(userId, updateUserDto);
  }

  @Delete()
  remove(@Req() request: Request) {
    const userId = request['user']['sub'];

    return this.profileService.removeProfile(userId);
  }
}
