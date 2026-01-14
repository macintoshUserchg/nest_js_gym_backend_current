import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const pgConfig: PostgresConnectionOptions = {
  url: 'postgresql://chandangaur@localhost:5432/gym_db',
  type: 'postgres',
  port: 5432,
  // schema: 'public',
  synchronize: true,
  // logging: 'all',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};
