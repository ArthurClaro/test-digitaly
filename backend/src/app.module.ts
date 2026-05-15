import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ScoresModule } from './scores/scores.module';
import { Score } from './scores/score.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5433),
        username: config.get<string>('DATABASE_USER', 'digitaly'),
        password: config.get<string>('DATABASE_PASS', 'digitaly'),
        database: config.get<string>('DATABASE_NAME', 'digitaly'),
        entities: [Score],
        migrations: ['dist/migrations/*.js'],
        synchronize: false,
        migrationsRun: false,
      }),
    }),
    AuthModule,
    ScoresModule,
  ],
})
export class AppModule {}
