import { FastifyReply, FastifyRequest } from 'fastify';
import { UserController } from './UserController';
import { UserService } from '@/services/UserService';
import { User, CreateUser } from '@/models/UserModel';
import { DatabaseService } from '@/services/DatabaseService';

// Mock UserService and DatabaseService
jest.mock('@/services/UserService');
jest.mock('@/services/DatabaseService');

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

    // Mock password hashing
    jest.spyOn(DatabaseService, 'hashPassword').mockImplementation(async (password) => `hashed_${password}`);
  });

  describe('getUsers', () => {
    it('should return all users with status 200', async () => {
      const mockUsers = [
        { 
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John',
          email: 'john@example.com',
          password: 'hashed_password123',
          createdAt: new Date('2025-01-01T18:28:35-05:00'),
          updatedAt: new Date('2025-01-01T18:28:35-05:00')
        },
        { 
          id: '987fcdeb-51a2-43d7-9b56-426614174001',
          name: 'Jane',
          email: 'jane@example.com',
          password: 'hashed_password456',
          createdAt: new Date('2025-01-01T18:28:35-05:00'),
          updatedAt: new Date('2025-01-01T18:28:35-05:00')
        },
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
    it('should return user by id with status 200', async () => {
      const mockUser = { 
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        email: 'john@example.com',
        password: 'hashed_password123',
        createdAt: new Date('2025-01-01T18:28:35-05:00'),
        updatedAt: new Date('2025-01-01T18:28:35-05:00')
      };

      mockRequest = {
        params: { id: mockUser.id },
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
    it('should create user and return 201 status', async () => {
      const newUser = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...newUser,
        password: 'hashed_password123',
        createdAt: new Date('2025-01-01T18:28:35-05:00'),
        updatedAt: new Date('2025-01-01T18:28:35-05:00')
      };

      mockRequest = {
        body: newUser,
      };

      mockUserService.create = jest.fn().mockResolvedValue(createdUser);

      await userController.createUser(
        mockRequest as FastifyRequest<{ Body: Omit<User, 'id'> }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(createdUser);
    });

    it('should return 400 when invalid user data', async () => {
      const invalidUserData = { name: '' }; // Invalid data missing email

      mockRequest = {
        body: invalidUserData,
      };

      await userController.createUser(
        mockRequest as FastifyRequest<{ Body: Omit<User, 'id'> }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid user data' });
    });

    it('should return 500 when service throws error', async () => {
      const mockUserData = { name: 'John', email: 'john@example.com', password: 'password123' };

      mockRequest = {
        body: mockUserData,
      };

      mockUserService.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.createUser(
        mockRequest as FastifyRequest<{ Body: Omit<User, 'id'> }>,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
  });
});
