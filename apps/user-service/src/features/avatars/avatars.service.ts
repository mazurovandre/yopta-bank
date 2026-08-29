import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(AvatarsService.name);

  constructor(
    @Inject(AVATARS_REPOSITORY)
    private readonly avatarRepository: IAvatarsRepository,
    private readonly configService: ConfigService,
    @Inject(IFileService) readonly fileService: IFileService,
  ) {}

  async upload(
    userId: number,
    file: IUploadedMulterFile,
  ): Promise<Avatar | null> {
    const activeCount = await this.avatarRepository.countActiveByUserId(userId);
    const maxAvatars = this.configService.get<number>('MAX_USER_AVATARS') ?? 5;

    if (activeCount >= maxAvatars) {
      this.logger.warn(
        `Avatar upload rejected: user id=${userId} reached the limit of ${maxAvatars}`,
      );
      throw new BadRequestException(`Max user avatars ${maxAvatars}`);
    }

    const mimetype = file.mimetype as string;
    const extension = EXTENSION_BY_MIME_TYPE[mimetype];
    const filename = `${randomUUID()}.${extension}`;

    await this.fileService.uploadFile({
      file,
      folder: 'avatars',
      name: filename,
    });

    let avatar: Avatar | null = null;

    try {
      avatar = await this.avatarRepository.create(userId, filename, maxAvatars);
    } catch (err) {
      await this.rollbackSavedFile(filename, userId);

      throw err;
    }

    if (!avatar) {
      await this.rollbackSavedFile(filename, userId);

      throw new BadRequestException(`Max user avatars ${maxAvatars}`);
    }

    this.logger.log(`Avatar "${filename}" uploaded for user id=${userId}`);

    return avatar;
  }

  async remove(userId: number, avatarId: number): Promise<void> {
    const avatar = await this.avatarRepository.findActiveByIdAndUserId(
      avatarId,
      userId,
    );
    if (!avatar) {
      this.logger.warn(
        `Avatar remove rejected: avatar id=${avatarId} of user id=${userId} not found`,
      );
      throw new NotFoundException('Avatar does not exist');
    }

    await this.avatarRepository.softDelete(avatarId);

    try {
      await this.fileService.removeFile({ path: `avatars/${avatar.filename}` });
    } catch (error) {
      this.logger.error(
        `Removing avatar file id="${avatarId}" failed`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    this.logger.log(`Avatar id=${avatarId} removed for user id=${userId}`);
  }

  private async rollbackSavedFile(
    filename: string,
    userId: number,
  ): Promise<void> {
    await this.fileService.removeFile({
      path: `avatars/${filename}`,
    });

    this.logger.warn(
      `Rollback saved S3 file: user id=${userId}, filename=${filename}`,
    );
  }
}
