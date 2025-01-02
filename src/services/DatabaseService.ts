import { drizzle } from 'drizzle-orm/node-postgres';
import * as argon2 from 'argon2';

const connectionString = process.env['DATABASE_URL'];

export class DatabaseService {
  private db;

  constructor() {
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    this.db = drizzle(`${connectionString}`!);
  }

  getDbClient() {
    return this.db;
  }

  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
