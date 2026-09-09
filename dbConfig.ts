import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

export const pgConfig: PostgresConnectionOptions = {
  url:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://chandangaur@localhost:5432/gym_db',
  type: 'postgres',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};
