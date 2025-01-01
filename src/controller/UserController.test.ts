import { FastifyReply, FastifyRequest } from 'fastify';
import { UserController } from './UserController';
import { UserService } from '@/services/UserService';
import { IUser } from '@/models/UserModel';

// Mock UserService
jest.mock('@/services/UserService');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>;
    userController = new UserController(mockUserService);

    // Setup mock reply
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getUsers', () => {
    it('should return all users with status 200', async () => {
      const mockUsers = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      mockUserService.findAll = jest.fn().mockResolvedValue(mockUsers);

      await userController.getUsers(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 when service throws error', async () => {
      mockUserService.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.getUsers(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('getUser', () => {
    it('should return user with status 200 when found', async () => {
      const mockUser = { id: 1, name: 'John', email: 'john@example.com' };
      mockRequest = {
        params: { id: '1' },
      };

      mockUserService.findById = jest.fn().mockResolvedValue(mockUser);

      await userController.getUser(
        mockRequest as FastifyRequest<{ Params: { id: string } }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockRequest = {
        params: { id: '999' },
      };

      mockUserService.findById = jest.fn().mockResolvedValue(null);

      await userController.getUser(
        mockRequest as FastifyRequest<{ Params: { id: string } }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 when service throws error', async () => {
      mockRequest = {
        params: { id: '1' },
      };

      mockUserService.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.getUser(
        mockRequest as FastifyRequest<{ Params: { id: string } }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });

  describe('createUser', () => {
    it('should create user and return 201 when valid data', async () => {
      const mockUserData = { name: 'John', email: 'john@example.com' };
      const mockCreatedUser = { id: 1, ...mockUserData };

      mockRequest = {
        body: mockUserData,
      };

      mockUserService.create = jest.fn().mockResolvedValue(mockCreatedUser);

      await userController.createUser(
        mockRequest as FastifyRequest<{ Body: Omit<IUser, 'id'> }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(mockCreatedUser);
    });

    it('should return 400 when invalid user data', async () => {
      const invalidUserData = { name: '' }; // Invalid data missing email

      mockRequest = {
        body: invalidUserData,
      };

      await userController.createUser(
        mockRequest as FastifyRequest<{ Body: Omit<IUser, 'id'> }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user data' });
    });

    it('should return 500 when service throws error', async () => {
      const mockUserData = { name: 'John', email: 'john@example.com' };

      mockRequest = {
        body: mockUserData,
      };

      mockUserService.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.createUser(
        mockRequest as FastifyRequest<{ Body: Omit<IUser, 'id'> }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});
