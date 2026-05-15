import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtUserPayload } from '../auth/auth.guard';
import { Score } from './score.entity';
import { BOARD_SIZES, BoardSize } from '../constants';

@Controller('scores')
@UseGuards(AuthGuard)
export class ScoresController {
  constructor(private readonly service: ScoresService) {}

  @Post()
  async create(
    @Body() dto: CreateScoreDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<Score> {
    return this.service.create(dto, user);
  }

  @Get('ranking')
  async ranking(
    @Query('boardSize') boardSize?: string,
  ): Promise<{ items: Score[] }> {
    const normalized = this.normalizeBoardSize(boardSize);
    return this.service.getRanking(normalized);
  }

  private normalizeBoardSize(value?: string): BoardSize | undefined {
    if (!value) {
      return undefined;
    }
    if (!BOARD_SIZES.includes(value as BoardSize)) {
      throw new BadRequestException(
        `boardSize must be one of: ${BOARD_SIZES.join(', ')}`,
      );
    }
    return value as BoardSize;
  }
}
