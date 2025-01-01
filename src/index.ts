import Fastify from 'fastify';
import { UserRoutes } from '@/routes/UserRoutes';

const fastify = Fastify({
  logger: true,
});

const registerRoutes = () => {
  fastify.register(UserRoutes, { prefix: '/users' });
};

const start = async () => {
  try {
    registerRoutes();

    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
