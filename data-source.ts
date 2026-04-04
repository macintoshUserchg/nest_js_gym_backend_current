import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://chandangaur@localhost:5432/gym_db',
  synchronize: false,
  logging: false,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
