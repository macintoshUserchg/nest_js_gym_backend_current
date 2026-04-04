import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const pgConfig: PostgresConnectionOptions = {
  url:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://chandangaur@localhost:5432/gym_db',
  type: 'postgres',
  synchronize: (process.env.NODE_ENV || 'development') === 'development',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};
