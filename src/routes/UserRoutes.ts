import { UserService } from '@/services/UserService';
import { UserController } from '@/controller/UserController';
import { FastifyInstance } from 'fastify';

export async function UserRoutes(fastify: FastifyInstance) {
  const userService = new UserService();
  const userController = new UserController(userService);

  fastify.get('/', userController.getUsers.bind(userController));
  fastify.get('/:id', userController.getUser.bind(userController));
  fastify.post('/', userController.createUser.bind(userController));
}
