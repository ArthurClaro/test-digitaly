import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './score.entity';
import { BoardSize, RANKING_LIMIT } from '../constants';

export interface CreateScoreInput {
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  boardSize: BoardSize;
  timeMs: number;
}

@Injectable()
export class ScoresRepository {
  constructor(
    @InjectRepository(Score)
    private readonly repo: Repository<Score>,
  ) {}

  async create(input: CreateScoreInput): Promise<Score> {
    const entity = this.repo.create(input);
    return this.repo.save(entity);
  }

  async findRanking(boardSize?: BoardSize): Promise<Score[]> {
    const qb = this.repo
      .createQueryBuilder('score')
      .orderBy('score.timeMs', 'ASC')
      .addOrderBy('score.createdAt', 'ASC')
      .limit(RANKING_LIMIT);

    if (boardSize) {
      qb.where('score.boardSize = :boardSize', { boardSize });
    }

    return qb.getMany();
  }
}
