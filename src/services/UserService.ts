import { CreateUser, User } from '@/models/UserModel';
import { DatabaseService } from './DatabaseService';
import { usersTable } from '@/models/UserModel';  
import { eq } from 'drizzle-orm';

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class UserService {
  private dbService: DatabaseService;
  private dbClient;

  constructor() {
    this.dbService = new DatabaseService(); 
    this.dbClient = this.dbService.getDbClient();
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.dbClient.select().from(usersTable);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new DatabaseError(`Failed to fetch users: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<User> {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    try {
      const [user] = await this.dbClient.select().from(usersTable).where(eq(usersTable.id, id));
      if (!user) {
        throw new UserNotFoundError(`User with ID ${id} not found`);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new DatabaseError(`Failed to fetch user: ${errorMessage}`);
    }
  }

  async create(userData: CreateUser): Promise<User> {
    if (!userData.email || !userData.password || !userData.name) {
      throw new ValidationError('Email, password, and name are required');
    }

    try {
      const hashedPassword = await DatabaseService.hashPassword(userData.password);
      const [user] = await this.dbClient
        .insert(usersTable)
        .values({ ...userData, password: hashedPassword })
        .returning();
      return user;
    } catch (error: unknown) {
      console.log('Error creating user:', error);
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new ValidationError('Email already exists');
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new DatabaseError(`Failed to create user: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<User> {
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    try {
      const [user] = await this.dbClient.delete(usersTable).where(eq(usersTable.id, id)).returning();
      if (!user) {
        throw new UserNotFoundError(`User with ID ${id} not found`);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new DatabaseError(`Failed to delete user: ${errorMessage}`);
    }
  }
}
