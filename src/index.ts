import Fastify from 'fastify';
import { UserRoutes } from '@/routes/UserRoutes';

const fastify = Fastify({
  logger: true,
});

// Register routes
fastify.register(UserRoutes, { prefix: '/users' });

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
