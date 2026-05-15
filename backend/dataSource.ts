import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { Score } from './src/scores/score.entity';
import { CreateScores0001 } from './src/migrations/0001-create-scores';

loadEnv();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5433),
  username: process.env.DATABASE_USER ?? 'digitaly',
  password: process.env.DATABASE_PASS ?? 'digitaly',
  database: process.env.DATABASE_NAME ?? 'digitaly',
  entities: [Score],
  migrations: [CreateScores0001],
  synchronize: false,
});

export default AppDataSource;
