import { User } from '@/models/UserModel';
import { UserService } from './UserService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should find all users', async () => {
    const users = await userService.findAll();
    expect(users).toBeInstanceOf(Array);
  });

  it('should find a user by id', async () => {
    const user = await userService.create({ name: 'John', email: 'john@example.com' });
    const foundUser = await userService.findById(user.id);
    expect(foundUser).toBeInstanceOf(User);

    const notFoundUser = await userService.findById(999);
    expect(notFoundUser).toBeNull();
  });

  it('should create a user', async () => {
    const user = await userService.create({ name: 'John', email: 'john@example.com' });
    expect(user).toBeInstanceOf(User);
  });
});
