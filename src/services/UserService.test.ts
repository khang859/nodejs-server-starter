import { UserService } from './UserService';
import { DatabaseService } from './DatabaseService';
import { UserNotFoundError, ValidationError } from './UserService';
import { usersTable } from '@/models/UserModel';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { NodePgClient } from 'drizzle-orm/node-postgres/session';

// Mock DatabaseService
jest.mock('./DatabaseService');

describe('UserService', () => {
  let userService: UserService;
  let mockSelect: jest.Mock;
  let mockWhere: jest.Mock;
  let mockInsert: jest.Mock;
  let mockValues: jest.Mock;
  let mockDelete: jest.Mock;
  let mockReturning: jest.Mock;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();

    // Mock password hashing
    jest.spyOn(DatabaseService, 'hashPassword').mockImplementation(async (password) => `hashed_${password}`);

    // Setup mock chain
    mockReturning = jest.fn();
    mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
    mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
    mockInsert = jest.fn().mockReturnValue({ values: mockValues });
    mockDelete = jest.fn().mockReturnValue({ where: mockWhere });
    mockSelect = jest.fn().mockReturnValue({ 
      from: jest.fn().mockReturnValue({
        where: mockWhere
      })
    });

    // Create a mock NodePgClient
    const mockPgClient = {
      query: jest.fn(),
      release: jest.fn(),
      end: jest.fn(),
      connect: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as NodePgClient;

    // Setup dbClient mock with proper typing
    const mockDbClient = {
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
      // Add required Drizzle ORM methods
      query: jest.fn(),
      $with: jest.fn(),
      $count: jest.fn(),
      $queryBuilder: jest.fn(),
      $transaction: jest.fn(),
      _: {},
      $client: mockPgClient,
      execute: jest.fn(),
      prepare: jest.fn(),
    } as unknown as NodePgDatabase<Record<string, never>> & { $client: NodePgClient };

    userService['dbClient'] = mockDbClient;
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const mockUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John',
          email: 'john@example.com',
          password: 'hashed_password123',
          createdAt: new Date('2025-01-01T18:33:01-05:00'),
          updatedAt: new Date('2025-01-01T18:33:01-05:00')
        }
      ];

      mockSelect.mockReturnValueOnce({ 
        from: jest.fn().mockReturnValue(mockUsers)
      });

      const users = await userService.findAll();
      expect(users).toEqual(mockUsers);
      expect(mockSelect).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockSelect.mockReturnValueOnce({ 
        from: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      });
      
      await expect(userService.findAll()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        email: 'john@example.com',
        password: 'hashed_password123',
        createdAt: new Date('2025-01-01T18:33:01-05:00'),
        updatedAt: new Date('2025-01-01T18:33:01-05:00')
      };

      mockSelect.mockReturnValueOnce({ 
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue([mockUser])
        })
      });

      const foundUser = await userService.findById(mockUser.id);
      expect(foundUser).toEqual(mockUser);
      expect(mockSelect).toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      mockSelect.mockReturnValueOnce({ 
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue([])
        })
      });

      await expect(userService.findById('non-existent-id'))
        .rejects
        .toThrow(UserNotFoundError);
    });

    it('should throw ValidationError when id is empty', async () => {
      await expect(userService.findById(''))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123'
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        email: 'john@example.com',
        createdAt: new Date('2025-01-01T18:33:01-05:00'),
        updatedAt: new Date('2025-01-01T18:33:01-05:00')
      };

      mockInsert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([expectedUser])
        })
      });
      
      const user = await userService.create(newUser);
      expect(user).toEqual(expectedUser);
      expect(DatabaseService.hashPassword).toHaveBeenCalledWith(newUser.password);
      expect(mockInsert).toHaveBeenCalledWith(usersTable);
    });

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(userService.create({ name: 'John', email: '', password: '' }))
        .rejects
        .toThrow(ValidationError);
    });

    it('should throw ValidationError when email already exists', async () => {
      const newUser = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create an error object that matches PostgreSQL's unique violation
      const uniqueViolationError = new Error('duplicate key value violates unique constraint');
      Object.assign(uniqueViolationError, { code: '23505' });

      mockInsert.mockReturnValueOnce({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(uniqueViolationError)
        })
      });
      
      await expect(userService.create(newUser))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        email: 'john@example.com',
        password: 'hashed_password123',
        createdAt: new Date('2025-01-01T18:33:01-05:00'),
        updatedAt: new Date('2025-01-01T18:33:01-05:00')
      };

      mockDelete.mockReturnValueOnce({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser])
        })
      });
      
      const deletedUser = await userService.delete(mockUser.id);
      expect(deletedUser).toEqual(mockUser);
      expect(mockDelete).toHaveBeenCalledWith(usersTable);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      mockDelete.mockReturnValueOnce({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([])
        })
      });
      
      await expect(userService.delete('non-existent-id'))
        .rejects
        .toThrow(UserNotFoundError);
    });

    it('should throw ValidationError when id is empty', async () => {
      await expect(userService.delete(''))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
