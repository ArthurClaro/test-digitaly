import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BOARD_SIZES, DIFFICULTIES } from '@/lib/minesweeper/config';
import { formatTime } from '@/lib/minesweeper/format';
import type { BoardSize } from '@/lib/minesweeper/types';
import { ArrowLeft, Trophy } from 'lucide-react';

interface ScoreItem {
  id: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  boardSize: BoardSize;
  timeMs: number;
  createdAt: string;
}

interface RankingResponse {
  items: ScoreItem[];
}

interface RankingPageProps {
  searchParams: Promise<{ boardSize?: string }>;
}

function isValidBoardSize(value: string | undefined): value is BoardSize {
  return !!value && (BOARD_SIZES as ReadonlyArray<string>).includes(value);
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const filter: BoardSize | undefined = isValidBoardSize(params.boardSize)
    ? params.boardSize
    : undefined;

  const queryString = filter ? `?boardSize=${encodeURIComponent(filter)}` : '';

  let items: ScoreItem[] = [];
  let error: string | null = null;
  try {
    const data = await apiFetch<RankingResponse>(
      `/scores/ranking${queryString}`,
      { method: 'GET' },
      session.backendJwt,
    );
    items = data.items;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erro ao carregar ranking';
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 30 — Ranking Global
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filtrar por tamanho">
          <FilterLink active={!filter} href="/ranking" label="Todos" />
          {BOARD_SIZES.map((size) => (
            <FilterLink
              key={size}
              active={filter === size}
              href={`/ranking?boardSize=${encodeURIComponent(size)}`}
              label={DIFFICULTIES[size].label}
            />
          ))}
        </nav>

        {error ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            Falha ao carregar ranking: {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border bg-white p-6 text-center text-sm text-muted-foreground">
            Nenhum score registrado ainda. Seja o primeiro!
          </div>
        ) : (
          <div className="rounded-lg border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="text-right">Tempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {item.userAvatar ? (
                            <AvatarImage
                              src={item.userAvatar}
                              alt={item.userName ?? 'avatar'}
                            />
                          ) : null}
                          <AvatarFallback>
                            {(item.userName ?? '?').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {item.userName ?? 'Anônimo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{DIFFICULTIES[item.boardSize].label}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatTime(item.timeMs)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </main>
  );
}

function FilterLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'bg-white hover:bg-muted'
      }`}
    >
      {label}
    </Link>
  );
}
