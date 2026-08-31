import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from './s3.service';
import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { UploadException } from './exceptions/upload.exception';
import { RemoveException } from './exceptions/remove.exception';
import { generateFileMock } from '../__mocks__/generate-file-mock';

type S3Callback = (error: Error | null) => void;

describe('S3Service', () => {
  let s3Service: S3Service;
  let s3: { putObject: jest.Mock; deleteObject: jest.Mock };

  const file = generateFileMock();

  beforeEach(async () => {
    s3 = {
      putObject: jest.fn((_params: unknown, callback: S3Callback) =>
        callback(null),
      ),
      deleteObject: jest.fn((_params: unknown, callback: S3Callback) =>
        callback(null),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, { provide: S3Lib, useValue: s3 }],
    }).compile();

    s3Service = module.get(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(s3Service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('puts the object under "folder/name" and returns its path', async () => {
      const result = await s3Service.uploadFile({
        file,
        folder: 'avatars',
        name: 'file.png',
      });

      expect(s3.putObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'user-avatars',
          Key: 'avatars/file.png',
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
        expect.any(Function),
      );
      expect(result).toEqual({ path: 'avatars/file.png' });
    });

    it('rejects with UploadException when the client fails', async () => {
      s3.putObject.mockImplementation((_params: unknown, cb: S3Callback) =>
        cb(new Error('bucket does not exist')),
      );

      await expect(
        s3Service.uploadFile({ file, folder: 'avatars', name: 'file.png' }),
      ).rejects.toThrow(UploadException);
    });
  });

  describe('removeFile', () => {
    it('deletes the object by path', async () => {
      await expect(
        s3Service.removeFile({ path: 'avatars/file.png' }),
      ).resolves.toBeUndefined();

      expect(s3.deleteObject).toHaveBeenCalledWith(
        { Bucket: 'user-avatars', Key: 'avatars/file.png' },
        expect.any(Function),
      );
    });

    it('rejects with RemoveException when the client fails', async () => {
      s3.deleteObject.mockImplementation((_params: unknown, cb: S3Callback) =>
        cb(new Error('no such key')),
      );

      await expect(
        s3Service.removeFile({ path: 'avatars/file.png' }),
      ).rejects.toThrow(RemoveException);
    });
  });
});
