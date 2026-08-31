import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { IUploadedMulterFile } from '../../../providers/files/s3/interfaces/upload-file.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class ParseAvatarFilePipe implements PipeTransform {
  transform(value: IUploadedMulterFile): IUploadedMulterFile {
    if (!value) {
      throw new BadRequestException('File is required');
    }

    if (!value.mimetype || !ALLOWED_MIME_TYPES.includes(value.mimetype)) {
      throw new BadRequestException('Only JPEG or PNG types are allowed');
    }

    if (!value.size || value.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File is too large');
    }

    return value;
  }
}
