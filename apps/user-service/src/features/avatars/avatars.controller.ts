import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../../../../../libs/token/src/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';
import { AvatarsService } from '@features/avatars/avatars.service';
import { ParseAvatarFilePipe } from '@features/avatars/pipes/parse-avatar-file.pipe';
import { Avatar } from '@features/avatars/entities/avatar.entity';

@ApiTags('Avatars')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Токен отсутствует или невалиден' })
@UseGuards(AuthGuard)
@Controller('users/me/avatars')
export class AvatarsController {
  constructor(private readonly avatarService: AvatarsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatars'))
  @ApiOperation({
    summary: 'Загрузить аватар текущего пользователя',
    description:
      'Принимает multipart/form-data с полем `avatars`. Допустимы JPEG и PNG размером до 10 МБ.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      required: ['avatars'],
      properties: {
        avatars: {
          type: 'string',
          format: 'binary',
          description: 'Файл аватара (JPEG или PNG, не более 10 МБ)',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Аватар загружен', type: Avatar })
  @ApiBadRequestResponse({
    description:
      'Файл не приложен, неподдерживаемый тип или размер, либо исчерпан лимит аватаров',
  })
  upload(
    @Req() request: Request,
    @UploadedFile(new ParseAvatarFilePipe()) file: IUploadedMulterFile,
  ) {
    return this.avatarService.upload(request['user']['sub'], file);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить аватар текущего пользователя',
    description:
      'Помечает запись удалённой и удаляет файл из хранилища. Чужой аватар удалить нельзя.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор аватара',
  })
  @ApiOkResponse({ description: 'Аватар удалён' })
  @ApiNotFoundResponse({
    description: 'Аватар не найден или принадлежит другому пользователю',
  })
  remove(@Req() request: Request, @Param('id') id: string) {
    return this.avatarService.remove(request['user']['sub'], parseInt(id));
  }
}
