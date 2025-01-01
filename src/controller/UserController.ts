import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '@/services/UserService';
import { IUser, User } from '@/models/UserModel';
export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAll();
      return reply.code(200).send(users);
    } catch (error) {
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      const user = await this.userService.findById(id);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.code(200).send(user);
    } catch (error) {
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async createUser(request: FastifyRequest<{ Body: Omit<IUser, 'id'> }>, reply: FastifyReply) {
    try {
      const userData = request.body;

      if (!User.validate(userData)) {
        return reply.code(400).send({ error: 'Invalid user data' });
      }

      const user = await this.userService.create(userData);
      return reply.code(201).send(user);
    } catch (error) {
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}
