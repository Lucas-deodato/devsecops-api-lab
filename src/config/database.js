import knex from 'knex';
import configurations from '../../knexfile.js';

const environment = process.env.NODE_ENV ?? 'development';
const configuration = configurations[environment];

if (!configuration) {
  throw new Error(`Database configuration not found for ${environment}`);
}

export const db = knex(configuration);