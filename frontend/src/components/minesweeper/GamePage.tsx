'use client';

import { useSession } from 'next-auth/react';

export function GamePage() {
  const { data: session } = useSession();
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div>
        Olá {session?.user?.name ?? 'jogador'} — carregando jogo...
      </div>
    </main>
  );
}
