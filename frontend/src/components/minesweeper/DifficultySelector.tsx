'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BOARD_SIZES, DIFFICULTIES } from '@/lib/minesweeper/config';
import type { BoardSize } from '@/lib/minesweeper/types';

export interface DifficultySelectorProps {
  readonly value: BoardSize;
  readonly onChange: (size: BoardSize) => void;
  readonly disabled?: boolean;
}

export function DifficultySelector({ value, onChange, disabled }: DifficultySelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as BoardSize)}
      disabled={disabled}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {BOARD_SIZES.map((size) => (
          <SelectItem key={size} value={size}>
            {DIFFICULTIES[size].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
