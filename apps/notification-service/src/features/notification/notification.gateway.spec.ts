import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let notificationService: jest.Mocked<
    Pick<NotificationService, 'authenticate'>
  >;
  let client: jest.Mocked<Pick<Socket, 'join' | 'disconnect'>>;
  let io: jest.Mocked<Pick<Server, 'to' | 'emit'>>;

  beforeEach(async () => {
    notificationService = { authenticate: jest.fn() };
    client = { join: jest.fn(), disconnect: jest.fn() };
    io = { to: jest.fn(), emit: jest.fn() };
    io.to.mockReturnValue(io as unknown as ReturnType<Server['to']>);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    gateway = module.get(NotificationGateway);
    gateway.io = io as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('joins the user room when authentication succeeds', async () => {
      notificationService.authenticate.mockResolvedValue(1);

      await gateway.handleConnection(client as unknown as Socket);

      expect(client.join).toHaveBeenCalledWith('1');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects the client when authentication fails', async () => {
      notificationService.authenticate.mockResolvedValue(null);

      await gateway.handleConnection(client as unknown as Socket);

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('emits the message to the user room', () => {
      gateway.sendNotification(1, 'hello');

      expect(io.to).toHaveBeenCalledWith('1');
      expect(io.emit).toHaveBeenCalledWith('notification', {
        data: 'hello',
      });
    });
  });
});
