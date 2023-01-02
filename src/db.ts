import path from 'path';

export const DB = {
  DATABASE_NAME: '',
  DATABASE_PATH: ((): string => path.join(__dirname, '..', 'data'))(),
  ALLOWED_TYPES: ['string', 'number', 'boolean', 'object', 'array'],
};
