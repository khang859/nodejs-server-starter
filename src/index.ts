import Fastify from 'fastify';
import { UserRoutes } from '@/routes/UserRoutes';

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  try {
    fastify.register(UserRoutes, { prefix: '/users' });

    fastify.get('/', (req, res) => {
      res.send('Hello World');
    });

    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port: Number(port), host });
    fastify.log.info(`Server is running on port http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
