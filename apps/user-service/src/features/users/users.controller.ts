import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TokenGuard } from '@libs/token/token.guard';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateUserDto } from '@features/users/dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { RefreshPasswordDto } from '@features/users/dto/refresh-password.dto';
import { Paginated } from '@common/types/paginated.type';
import { FindMostActiveQueryDto } from '@features/users/dto/find-most-active-query.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { TransferBalanceDto } from './dto/transfer-balance.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
  @CacheTTL(30000)
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

  @Get('/most-active')
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
  @ApiQuery({
    name: 'minAvatars',
    required: false,
    type: Number,
    default: 2,
    description: 'Минимальное количество аватарок',
  })
  findMostActive(
    @Query() query: FindMostActiveQueryDto,
  ): Promise<Paginated<User>> {
    return this.usersService.findMostActive(query);
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

  @Post('/transfer-balance')
  async transferBalance(
    @Req() request: Request,
    @Body() transferBalanceDto: TransferBalanceDto,
  ) {
    const userId = request['user']['sub'];

    return this.usersService.transferBalance(userId, transferBalanceDto);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor, ClassSerializerInterceptor)
  @CacheTTL(30000)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(parseInt(id));

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
