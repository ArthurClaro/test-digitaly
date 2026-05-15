import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BOARD_SIZES, BoardSize } from '../constants';

@Entity('scores')
@Index('idx_scores_board_time', ['boardSize', 'timeMs'])
export class Score {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', name: 'user_name', nullable: true })
  userName!: string | null;

  @Column({ type: 'varchar', name: 'user_avatar', nullable: true })
  userAvatar!: string | null;

  @Column({
    type: 'enum',
    name: 'board_size',
    enum: BOARD_SIZES,
  })
  boardSize!: BoardSize;

  @Column({ type: 'int', name: 'time_ms' })
  timeMs!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
