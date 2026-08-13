import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AVATARS_REPOSITORY,
  IAvatarsRepository,
} from '@features/avatars/repositories/avatars.interface';
import { Avatar } from '@features/avatars/entities/avatar.entity';
import { IUploadedMulterFile } from '../../providers/files/s3/interfaces/upload-file.interface';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { IFileService } from '../../providers/files/files.adapter';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

@Injectable()
export class AvatarsService {
  constructor(
    @Inject(AVATARS_REPOSITORY)
    private readonly avatarRepository: IAvatarsRepository,
    private readonly configService: ConfigService,
    @Inject(IFileService) readonly fileService: IFileService,
  ) {}

  async upload(userId: number, file: IUploadedMulterFile): Promise<Avatar> {
    const activeCount = await this.avatarRepository.countActiveByUserId(userId);
    const maxAvatars = this.configService.get<number>('MAX_USER_AVATARS') ?? 5;

    if (activeCount >= maxAvatars) {
      throw new BadRequestException(`Max user avatars ${maxAvatars}`);
    }

    const extension = EXTENSION_BY_MIME_TYPE[file.mimetype!] ?? 'png';
    const filename = `${randomUUID()}.${extension}`;

    await this.fileService.uploadFile({
      file,
      folder: 'avatars',
      name: filename,
    });

    return this.avatarRepository.create(userId, filename);
  }

  async remove(userId: number, avatarId: number): Promise<void> {
    const avatar = await this.avatarRepository.findActiveByIdAndUserId(
      avatarId,
      userId,
    );
    if (!avatar) {
      throw new NotFoundException('Avatar does not exist');
    }

    await this.avatarRepository.softDelete(avatarId);
    await this.fileService.removeFile({ path: `avatars/${avatar.filename}` });
  }
}
