export interface IUser {
  id: number;
  name: string;
  email: string;
}

export class User implements IUser {
  id: number;
  name: string;
  email: string;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static validate(user: Partial<IUser>): boolean {
    if (!user.name || !user.email) return false;
    if (typeof user.name !== 'string' || typeof user.email !== 'string') return false;
    return true;
  }
}
