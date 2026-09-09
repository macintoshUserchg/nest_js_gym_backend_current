import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://chandangaur@localhost:5432/gym_db',
  synchronize: false,
  logging: false,
  entities: [
    isProduction ? 'dist/src/**/*.entity.js' : 'src/**/*.entity{.ts,.js}',
  ],
  migrations: [
    isProduction ? 'dist/src/migrations/*.js' : 'src/migrations/*{.ts,.js}',
  ],
  migrationsTableName: 'migrations',
});
