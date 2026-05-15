import { Injectable } from '@nestjs/common';
import { ScoresRepository } from './scores.repository';
import { CreateScoreDto } from './dto/create-score.dto';
import { Score } from './score.entity';
import { JwtUserPayload } from '../auth/auth.guard';
import { BoardSize } from '../constants';

@Injectable()
export class ScoresService {
  constructor(private readonly repository: ScoresRepository) {}

  async create(dto: CreateScoreDto, user: JwtUserPayload): Promise<Score> {
    return this.repository.create({
      userId: user.sub,
      userName: user.name ?? null,
      userAvatar: user.picture ?? null,
      boardSize: dto.boardSize,
      timeMs: dto.timeMs,
    });
  }

  async getRanking(boardSize?: BoardSize): Promise<{ items: Score[] }> {
    const items = await this.repository.findRanking(boardSize);
    return { items };
  }
}
