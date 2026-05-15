'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Bomb, RotateCcw, Trophy, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Board } from './Board';
import { Timer } from './Timer';
import { DifficultySelector } from './DifficultySelector';
import { GameStatusDialog } from './GameStatus';

import { DEFAULT_DIFFICULTY, DIFFICULTIES } from '@/lib/minesweeper/config';
import { createEmptyBoard, generateBoard } from '@/lib/minesweeper/generate';
import {
  checkWin,
  countFlags,
  hasExplodedMine,
  revealCell,
  toggleFlag,
} from '@/lib/minesweeper/reveal';
import type { Board as BoardType, BoardSize, GameStatus } from '@/lib/minesweeper/types';

type SubmitState = 'idle' | 'submitting' | 'submitted' | 'error';

interface GameInternalState {
  board: BoardType;
  status: GameStatus;
  startedAt: number | null;
  endedAt: number | null;
  initialized: boolean;
}

function buildInitialState(difficulty: BoardSize): GameInternalState {
  return {
    board: createEmptyBoard(difficulty),
    status: 'idle',
    startedAt: null,
    endedAt: null,
    initialized: false,
  };
}

export function GamePage() {
  const { data: session } = useSession();
  const [difficulty, setDifficulty] = useState<BoardSize>(DEFAULT_DIFFICULTY);
  const [game, setGame] = useState<GameInternalState>(() =>
    buildInitialState(DEFAULT_DIFFICULTY),
  );
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const config = DIFFICULTIES[difficulty];
  const flagsPlaced = useMemo(() => countFlags(game.board), [game.board]);
  const minesLeft = config.mines - flagsPlaced;
  const isGameOver = game.status === 'won' || game.status === 'lost';

  const resetGame = useCallback(
    (size: BoardSize) => {
      setGame(buildInitialState(size));
      setSubmitState('idle');
      setSubmitError(null);
    },
    [],
  );

  const handleDifficultyChange = (size: BoardSize) => {
    setDifficulty(size);
    resetGame(size);
  };

  const submitScore = useCallback(
    async (timeMs: number, boardSize: BoardSize) => {
      const token = session?.backendJwt;
      if (!token) {
        setSubmitState('error');
        setSubmitError('Sessão sem token. Faça login novamente.');
        return;
      }
      try {
        setSubmitState('submitting');
        const { apiFetch } = await import('@/lib/api');
        await apiFetch('/scores', {
          method: 'POST',
          body: JSON.stringify({ boardSize, timeMs }),
        }, token);
        setSubmitState('submitted');
      } catch (err) {
        setSubmitState('error');
        setSubmitError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    },
    [session?.backendJwt],
  );

  const handleReveal = useCallback(
    (row: number, col: number) => {
      setGame((prev) => {
        if (prev.status === 'won' || prev.status === 'lost') {
          return prev;
        }

        const isFirstClick = !prev.initialized;
        const workingBoard = isFirstClick
          ? generateBoard(difficulty, row, col)
          : prev.board;

        const nextBoard = revealCell(workingBoard, row, col);
        const exploded = hasExplodedMine(nextBoard);
        const won = !exploded && checkWin(nextBoard);
        const nextStatus: GameStatus = exploded
          ? 'lost'
          : won
            ? 'won'
            : 'playing';

        const startedAt = prev.startedAt ?? (isFirstClick ? Date.now() : null);
        const endedAt =
          nextStatus === 'won' || nextStatus === 'lost' ? Date.now() : prev.endedAt;

        return {
          board: nextBoard,
          status: nextStatus,
          startedAt,
          endedAt,
          initialized: true,
        };
      });
    },
    [difficulty],
  );

  const handleFlag = useCallback((row: number, col: number) => {
    setGame((prev) => {
      if (prev.status === 'won' || prev.status === 'lost' || !prev.initialized) {
        return prev;
      }
      return { ...prev, board: toggleFlag(prev.board, row, col) };
    });
  }, []);

  useEffect(() => {
    if (game.status === 'won' && game.startedAt && game.endedAt && submitState === 'idle') {
      const elapsed = game.endedAt - game.startedAt;
      void submitScore(elapsed, difficulty);
    }
  }, [game.status, game.startedAt, game.endedAt, submitState, submitScore, difficulty]);

  const elapsedMs =
    game.startedAt && game.endedAt ? game.endedAt - game.startedAt : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold">Campo Minado</h1>
          <div className="flex items-center gap-3">
            <Link href="/ranking">
              <Button variant="outline" size="sm">
                <Trophy className="h-4 w-4" />
                Ranking
              </Button>
            </Link>
            <Avatar className="h-8 w-8">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name ?? 'avatar'} />
              ) : null}
              <AvatarFallback>
                {(session?.user?.name ?? '?').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session?.user?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ redirectTo: '/login' })}
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <DifficultySelector
              value={difficulty}
              onChange={handleDifficultyChange}
              disabled={false}
            />
            <Button onClick={() => resetGame(difficulty)} variant="outline">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono text-lg">
              <Bomb className="h-5 w-5" />
              <span>{String(minesLeft).padStart(3, '0')}</span>
            </div>
            <Timer startedAt={game.startedAt} endedAt={game.endedAt} />
          </div>
        </div>

        <div className="overflow-auto">
          <Board
            board={game.board}
            disabled={isGameOver}
            onReveal={handleReveal}
            onFlag={handleFlag}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Clique esquerdo revela uma célula. Clique direito coloca/remove uma bandeira.
        </p>
      </section>

      <GameStatusDialog
        status={game.status}
        elapsedMs={elapsedMs}
        submitState={submitState}
        submitError={submitError}
        onPlayAgain={() => resetGame(difficulty)}
      />
    </main>
  );
}
