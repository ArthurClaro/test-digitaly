import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { Score } from './src/scores/score.entity';
import { CreateScores1715000000000 } from './src/migrations/1715000000000-create-scores';

loadEnv();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5433),
  username: process.env.DATABASE_USER ?? 'digitaly',
  password: process.env.DATABASE_PASS ?? 'digitaly',
  database: process.env.DATABASE_NAME ?? 'digitaly',
  entities: [Score],
  migrations: [CreateScores1715000000000],
  synchronize: false,
});

export default AppDataSource;
