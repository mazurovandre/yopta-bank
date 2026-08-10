import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@auth/auth.guard';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateUserDto } from '@features/users/dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { RefreshPasswordDto } from '@features/users/dto/refresh-password.dto';
import { Paginated } from '@common/types/paginated.type';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    default: 1,
    description: 'Номер страницы пагинации',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    default: 10,
    description: 'Количество элементов',
  })
  findAll(@Query() query: FindUsersQueryDto): Promise<Paginated<User>> {
    return this.usersService.findAll(query);
  }

  @Get('/me')
  async findMyself(@Req() request: Request) {
    const username = request['user']['username'];
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Patch('/me')
  updateMyself(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = request['user']['sub'];

    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('/me')
  removeMyself(@Req() request: Request) {
    const userId = request['user']['sub'];

    return this.usersService.remove(userId);
  }

  @Patch('/refresh-password')
  refreshPassword(
    @Req() request: Request,
    @Body() refreshPasswordDto: RefreshPasswordDto,
  ) {
    const userId = request['user']['sub'];

    return this.usersService.refreshPassword(userId, refreshPasswordDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(parseInt(id));

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
