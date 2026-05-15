'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/minesweeper/format';
import type { GameStatus as Status } from '@/lib/minesweeper/types';

export interface GameStatusProps {
  readonly status: Status;
  readonly elapsedMs: number;
  readonly submitState: 'idle' | 'submitting' | 'submitted' | 'error';
  readonly submitError: string | null;
  readonly onPlayAgain: () => void;
}

export function GameStatusDialog({
  status,
  elapsedMs,
  submitState,
  submitError,
  onPlayAgain,
}: GameStatusProps) {
  const open = status === 'won' || status === 'lost';
  const isWin = status === 'won';

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={isWin ? 'text-green-600' : 'text-red-600'}>
            {isWin ? 'Vitória!' : 'Boom! Você perdeu.'}
          </DialogTitle>
          <DialogDescription>
            {isWin
              ? `Tempo: ${formatTime(elapsedMs)}`
              : 'Tente novamente — clique em "Jogar de novo".'}
          </DialogDescription>
        </DialogHeader>
        {isWin ? (
          <div className="text-sm text-muted-foreground">
            {submitState === 'submitting' && 'Enviando score...'}
            {submitState === 'submitted' && 'Score enviado para o ranking.'}
            {submitState === 'error' && (
              <span className="text-red-600">Erro: {submitError}</span>
            )}
          </div>
        ) : null}
        <DialogFooter>
          <Button onClick={onPlayAgain}>Jogar de novo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
