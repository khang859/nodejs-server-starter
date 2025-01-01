import { IUser, User } from '@/models/UserModel';

export class UserService {
  // TODO: Implement database connection
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async create(userData: Omit<IUser, 'id'>): Promise<User> {
    const id = this.users.length + 1;
    const user = new User(id, userData.name, userData.email);
    this.users.push(user);
    return user;
  }
}
