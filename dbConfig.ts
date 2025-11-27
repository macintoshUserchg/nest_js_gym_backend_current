import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const pgConfig: PostgresConnectionOptions = {
  url: 'postgresql://neondb_owner:npg_YEBrwW5Vu9PX@ep-round-boat-a1lt3xsx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  type: 'postgres',
  port: 5432,
  // schema: 'public',
  synchronize: true,
  // logging: 'all',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};
