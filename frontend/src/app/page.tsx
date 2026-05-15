import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { GamePage } from '@/components/minesweeper/GamePage';

export default async function HomePage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  return <GamePage />;
}
