import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AvatarsService } from './avatars.service';
import { Avatar } from './entities/avatar.entity';
import {
  AVATARS_REPOSITORY,
  IAvatarsRepository,
} from './repositories/avatars.interface';
import { IFileService } from '../../providers/files/files.adapter';
import { generateFileMock } from '../../providers/files/__mocks__/generate-file-mock';

jest.mock('node:crypto', () => ({
  ...jest.requireActual<typeof import('node:crypto')>('node:crypto'),
  randomUUID: jest.fn(() => 'fixed-uuid'),
}));

describe('AvatarsService', () => {
  let avatarsService: AvatarsService;
  let avatarsRepository: jest.Mocked<IAvatarsRepository>;
  let fileService: jest.Mocked<IFileService>;
  let configService: { get: jest.Mock };

  const file = generateFileMock();

  const mockAvatar = {
    id: 10,
    user_id: 1,
    filename: 'fixed-uuid.png',
  } as Avatar;

  beforeEach(async () => {
    avatarsRepository = {
      countActiveByUserId: jest.fn(),
      create: jest.fn(),
      findActiveByIdAndUserId: jest.fn(),
      softDelete: jest.fn(),
    };
    fileService = {
      uploadFile: jest.fn(),
      removeFile: jest.fn(),
    };
    configService = { get: jest.fn().mockReturnValue(5) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarsService,
        { provide: AVATARS_REPOSITORY, useValue: avatarsRepository },
        { provide: IFileService, useValue: fileService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    avatarsService = module.get(AvatarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('stores the file and saves the record', async () => {
      avatarsRepository.countActiveByUserId.mockResolvedValue(0);
      fileService.uploadFile.mockResolvedValue({
        path: 'avatars/fixed-uuid.png',
      });
      avatarsRepository.create.mockResolvedValue(mockAvatar);

      const result = await avatarsService.upload(1, file);

      expect(fileService.uploadFile).toHaveBeenCalledWith({
        file,
        folder: 'avatars',
        name: 'fixed-uuid.png',
      });
      expect(avatarsRepository.create).toHaveBeenCalledWith(
        1,
        'fixed-uuid.png',
      );
      expect(result).toEqual(mockAvatar);
    });

    it('maps image/jpeg to the jpg extension', async () => {
      avatarsRepository.countActiveByUserId.mockResolvedValue(0);
      fileService.uploadFile.mockResolvedValue({
        path: 'avatars/fixed-uuid.jpg',
      });
      avatarsRepository.create.mockResolvedValue(mockAvatar);

      await avatarsService.upload(1, { ...file, mimetype: 'image/jpeg' });

      expect(avatarsRepository.create).toHaveBeenCalledWith(
        1,
        'fixed-uuid.jpg',
      );
    });

    it('rejects when the user reached the avatars limit', async () => {
      avatarsRepository.countActiveByUserId.mockResolvedValue(5);

      await expect(avatarsService.upload(1, file)).rejects.toThrow(
        BadRequestException,
      );
      expect(fileService.uploadFile).not.toHaveBeenCalled();
      expect(avatarsRepository.create).not.toHaveBeenCalled();
    });

    it('falls back to the limit of 5 when MAX_USER_AVATARS is not set', async () => {
      configService.get.mockReturnValue(undefined);
      avatarsRepository.countActiveByUserId.mockResolvedValue(5);

      await expect(avatarsService.upload(1, file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('does not save the record when the storage upload fails', async () => {
      avatarsRepository.countActiveByUserId.mockResolvedValue(0);
      fileService.uploadFile.mockRejectedValue(new Error('s3 is down'));

      await expect(avatarsService.upload(1, file)).rejects.toThrow(
        's3 is down',
      );
      expect(avatarsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft-deletes the record and removes the file', async () => {
      avatarsRepository.findActiveByIdAndUserId.mockResolvedValue(mockAvatar);

      await avatarsService.remove(1, 10);

      expect(avatarsRepository.findActiveByIdAndUserId).toHaveBeenCalledWith(
        10,
        1,
      );
      expect(avatarsRepository.softDelete).toHaveBeenCalledWith(10);
      expect(fileService.removeFile).toHaveBeenCalledWith({
        path: 'avatars/fixed-uuid.png',
      });
    });

    it('throws NotFoundException for a missing or foreign avatar', async () => {
      avatarsRepository.findActiveByIdAndUserId.mockResolvedValue(null);

      await expect(avatarsService.remove(1, 10)).rejects.toThrow(
        NotFoundException,
      );
      expect(avatarsRepository.softDelete).not.toHaveBeenCalled();
      expect(fileService.removeFile).not.toHaveBeenCalled();
    });
  });
});
