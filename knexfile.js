import 'dotenv/config';
import { resolve } from 'node:path';

const databasePath = resolve(
  process.env.DATABASE_PATH ?? './data/helpdesk.sqlite',
);

const development = {
  client: 'better-sqlite3',
  connection: {
    filename: databasePath,
  },
  useNullAsDefault: true,
  migrations: {
    directory: resolve('database/migrations'),
    extension: 'js',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: resolve('database/seeds'),
    extension: 'js',
  },
  pool: {
    min: 1,
    max: 1,
    afterCreate(connection, done) {
      connection.pragma('foreign_keys = ON');
      done(null, connection);
    },
  },
};

export default {
  development,
};