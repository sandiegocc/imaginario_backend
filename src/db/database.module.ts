import { Global, Module } from '@nestjs/common';

import config from '../config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigType } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigType<typeof config>) => {
        const { connection, user, password, host, dbName } =
          configService.database;

        return {
          uri: `${connection}://${host}`,
          user,
          pass: password,
          dbName,
          autoIndex: true,
        };
      },
      inject: [config.KEY],
    }),
  ],
  providers: [],
})
export class DatabaseModule {}
