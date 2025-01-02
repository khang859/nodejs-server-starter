# NodeJS Server Starter

Simple NodeJS based server starter repo.

## Features

- NodeJS 22+
- Typescript
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod
- Eslint
- Prettier for code formatting
- Docker and Docker Compose

## Local Development

1. Clone the repository and `cd` into it
2. Run `yarn install` to install dependencies
3. Create a `.env` file with your database credentials (see `.env.example`)
4. Run `docker compose up -d` to start the server
5. Run `yarn db:push` to create the database (Make sure postgres docker container is running)
