import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UserService, ValidationError } from '@/services/UserService';
import { CreateUser } from '@/models/UserModel';

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAll();
      return reply.code(200).send(users);
    } catch (error) {
      console.log(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const user = await this.userService.findById(id);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.code(200).send(user);
    } catch (error) {
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async createUser(request: FastifyRequest<{ Body: CreateUser }>, reply: FastifyReply) {
    try {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
      });

      const userData = schema.safeParse(request.body);

      if (!userData.success) {
        return reply.code(400).send({ error: 'Invalid user data' });
      }

      const user = await this.userService.create(userData.data);
      return reply.code(201).send(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}
