import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod', 'staging').default('dev'),

  PORT: Joi.number().default(3000),

  // Variables de Base de Datos
  DB_NAME: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  MONGO_INIT_DB_ROOT_USERNAME: Joi.string().required(),
  MONGO_INIT_DB_ROOT_PASSWORD: Joi.string().required(),

  // Seguridad
  SECRET_KEY: Joi.string().required().min(32),
  SESSION_SECRET: Joi.string().required(),
  SECRET_FOR_REGISTER_USERS: Joi.string().required(),
});
