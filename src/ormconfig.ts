import { ConnectionOptions } from 'typeorm';
import * as path from 'path';

const config: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'bacale',
  database: 'cookie-auth',
  synchronize: false,
  entities: [path.join(__dirname, '**/*.entity{.js,.ts}')],
  migrations: [path.join(__dirname + '/migrations/**/*{.ts,.js}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default config;
