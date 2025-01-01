import { IUser, User } from './UserModel';

describe('User', () => {
  it('should create a user', () => {
    const user = new User(1, 'John', 'john@example.com');
    expect(user).toBeInstanceOf(User);
  });

  it('should validate user data', () => {
    const userData: IUser = { id: 1, name: 'John', email: 'john@example.com' };
    expect(User.validate(userData)).toBe(true);
  });

  it('should fail validation when name is not a string', () => {
    const userData: any = { id: 1, name: 1, email: 'john@example.com' };
    expect(User.validate(userData)).toBe(false);
  });

  it('should fail validation when email is not a string', () => {
    const userData: any = { id: 1, name: 'John', email: 1 };
    expect(User.validate(userData)).toBe(false);
  });

  it('should fail validation when email is not provided', () => {
    const userData: any = { id: 1, name: 'John' };
    expect(User.validate(userData)).toBe(false);
  });
});
