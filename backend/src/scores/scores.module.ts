import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from './score.entity';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { ScoresRepository } from './scores.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Score]), AuthModule],
  controllers: [ScoresController],
  providers: [ScoresService, ScoresRepository],
})
export class ScoresModule {}
