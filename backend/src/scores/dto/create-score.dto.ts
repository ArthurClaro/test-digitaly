import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { BOARD_SIZES, BoardSize } from '../../constants';

export class CreateScoreDto {
  @IsEnum(BOARD_SIZES, {
    message: `boardSize must be one of: ${BOARD_SIZES.join(', ')}`,
  })
  boardSize!: BoardSize;

  @IsInt({ message: 'timeMs must be an integer' })
  @IsPositive({ message: 'timeMs must be greater than 0' })
  timeMs!: number;
}
