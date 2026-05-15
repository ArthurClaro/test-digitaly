import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { BOARD_SIZES, BoardSize } from '../../constants';

const MIN_TIME_MS = 1_000;
const MAX_TIME_MS = 3_600_000;

export class CreateScoreDto {
  @IsEnum(BOARD_SIZES, {
    message: `boardSize must be one of: ${BOARD_SIZES.join(', ')}`,
  })
  boardSize!: BoardSize;

  @IsInt({ message: 'timeMs must be an integer' })
  @Min(MIN_TIME_MS, { message: `timeMs must be at least ${MIN_TIME_MS}` })
  @Max(MAX_TIME_MS, { message: `timeMs must be at most ${MAX_TIME_MS}` })
  timeMs!: number;
}
