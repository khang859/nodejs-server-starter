import { drizzle } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcrypt';

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
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
