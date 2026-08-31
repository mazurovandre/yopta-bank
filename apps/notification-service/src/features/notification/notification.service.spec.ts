import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from './notification.service';
import { TokenService } from '@libs/token/token.service';
import { JwtPayload } from '@libs/token/interfaces/jwt-payload.interface';
import { TransferNotification } from '@features/notification/schemas/transfer-notification.schema';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let tokenService: jest.Mocked<Pick<TokenService, 'verifyAccessToken'>>;
  let transferNotificationModel: jest.Mocked<
    Pick<Model<TransferNotification>, 'create'>
  >;

  const payload: JwtPayload = { sub: 1, username: 'john', type: 'access' };

  const buildClient = (authorization?: string) =>
    ({ handshake: { headers: { authorization } } }) as unknown as Socket;

  beforeEach(async () => {
    tokenService = { verifyAccessToken: jest.fn() };
    transferNotificationModel = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: TokenService, useValue: tokenService },
        {
          provide: getModelToken(TransferNotification.name),
          useValue: transferNotificationModel,
        },
      ],
    }).compile();

    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('returns the user id for a valid Bearer token', async () => {
      tokenService.verifyAccessToken.mockResolvedValue(payload);

      const userId = await notificationService.authenticate(
        buildClient('Bearer valid-token'),
      );

      expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(userId).toBe(1);
    });

    it('accepts a bare token without the Bearer prefix', async () => {
      tokenService.verifyAccessToken.mockResolvedValue(payload);

      const userId = await notificationService.authenticate(
        buildClient('valid-token'),
      );

      expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(
        'valid-token',
      );
      expect(userId).toBe(1);
    });

    it('returns null and skips verification when there is no auth header', async () => {
      const userId = await notificationService.authenticate(buildClient());

      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
      expect(userId).toBeNull();
    });

    it('returns null when the token is invalid or expired', async () => {
      tokenService.verifyAccessToken.mockRejectedValue(
        new Error('jwt expired'),
      );

      const userId = await notificationService.authenticate(
        buildClient('Bearer expired-token'),
      );

      expect(userId).toBeNull();
    });
  });

  describe('saveTransfer', () => {
    it('persists the transfer as a document', async () => {
      await notificationService.saveTransfer({
        senderId: 1,
        recipientId: 2,
        amount: 50.51,
      });

      expect(transferNotificationModel.create).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        amount: 50.51,
      });
    });
  });
});
