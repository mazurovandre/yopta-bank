import { BadRequestException } from '@nestjs/common';

import { ParseAvatarFilePipe } from './parse-avatar-file.pipe';
import { generateFileMock } from '../../../providers/files/__mocks__/generate-file-mock';
import { IUploadedMulterFile } from '../../../providers/files/s3/interfaces/upload-file.interface';

describe('ParseAvatarFilePipe', () => {
  const pipe = new ParseAvatarFilePipe();

  it('passes a valid png through untouched', () => {
    const file = generateFileMock();

    expect(pipe.transform(file)).toBe(file);
  });

  it('accepts jpeg as well', () => {
    const file = { ...generateFileMock(), mimetype: 'image/jpeg' };

    expect(pipe.transform(file)).toBe(file);
  });

  it('rejects a missing file', () => {
    expect(() =>
      pipe.transform(undefined as unknown as IUploadedMulterFile),
    ).toThrow(BadRequestException);
  });

  it('rejects an unsupported mime type', () => {
    const file = { ...generateFileMock(), mimetype: 'application/pdf' };

    expect(() => pipe.transform(file)).toThrow(
      'Only JPEG or PNG types are allowed',
    );
  });

  it('rejects a file larger than 10 MB', () => {
    const file = { ...generateFileMock(1024), size: 10 * 1024 * 1024 + 1 };

    expect(() => pipe.transform(file)).toThrow('File is too large');
  });
});
