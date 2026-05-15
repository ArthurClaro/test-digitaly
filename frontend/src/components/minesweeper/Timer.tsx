'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeShort } from '@/lib/minesweeper/format';

const TICK_INTERVAL_MS = 100;

export interface TimerProps {
  readonly startedAt: number | null;
  readonly endedAt: number | null;
}

export function Timer({ startedAt, endedAt }: TimerProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startedAt || endedAt) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);

  const elapsed = startedAt ? (endedAt ?? now) - startedAt : 0;

  return (
    <div className="flex items-center gap-2 font-mono text-lg">
      <Clock className="h-5 w-5" />
      <span>{formatTimeShort(elapsed)}</span>
    </div>
  );
}
