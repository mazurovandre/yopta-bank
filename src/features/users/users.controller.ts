import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

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
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('ageFrom', new DefaultValuePipe(0), ParseIntPipe)
    ageFrom: number = 0,
    @Query('ageTo', new DefaultValuePipe(999), ParseIntPipe)
    ageTo: number = 999,
    @Query('username') username?: string,
    @Query('email') email?: string,
  ): Promise<Pagination<User>> {
    return this.usersService.findAll(
      { page, limit },
      ageFrom,
      ageTo,
      username,
      email,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(parseInt(id));
  }

  @Patch(':id')
  update(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.update(parseInt(id), updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }
}
