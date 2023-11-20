import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';

import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DBOptions } from '../db.datasourceoptions';

const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
      // this will make our env files available all over the app
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const dbOptions: TypeOrmModuleOptions = {
          // retryAttempts: 10,
          // retryDelay: 3000,
          // autoLoadEntities: false
        };

        Object.assign(dbOptions, DBOptions);

        return dbOptions;
      },
    }),

    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     return {
    //       type: 'sqlite',
    //       database: config.get<string>('DB_NAME'),
    //       entities: [User, Report],
    //       synchronize: true,
    //     };
    //   },
    // }),
    // TypeOrmModule.forRoot({
    //   type: 'sqlite', // type of the DB
    //   database: 'db.sqlite', //name of the DB
    //   entities: [User, Report], // type of resources kept in DB
    //   synchronize: true, // only in dev env, automatically updates structure of DB, based on entities
    // }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // this tells app that every single request that comes in
      // must go through ValidationPipe
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // does not allow for extra fields to be added in
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  // this will be applied automatically when our app
  // starts listening for incoming traffic
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
        }),
      )
      .forRoutes('*');
  }
}
