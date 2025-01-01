import { defineConfig } from 'drizzle-kit';
import { readdirSync } from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL!;
const modelsPath = path.join(__dirname, 'src/models');

const models = () => {
  const files = readdirSync(modelsPath);
  return files.map(file => path.join(modelsPath, file));
};

export default defineConfig({
  out: './drizzle',
  schema: models(),
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
