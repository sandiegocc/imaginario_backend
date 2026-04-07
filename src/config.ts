import { registerAs } from '@nestjs/config';

// 1. Define la configuración en una constante
const config = registerAs('config', () => ({
  database: {
    dbName: process.env.DB_NAME,
    host: process.env.DB_HOST,
    usersCollection: process.env.DB_USERS_COLLECTION,
    connection: process.env.DB_CONNECTION,
    user: process.env.MONGO_INIT_DB_ROOT_USERNAME,
    password: process.env.MONGO_INIT_DB_ROOT_PASSWORD,
  },
  secretKey: process.env.SECRET_KEY,
  sessionSecretKey: process.env.SESSION_SECRET,
  secretForRegisterUsers: process.env.SECRET_FOR_REGISTER_USERS,
}));

// 2. Exporta la constante
export default config;
