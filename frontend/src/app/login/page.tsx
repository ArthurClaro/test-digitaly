import { signIn, auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github } from 'lucide-react';

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect('/');
  }

  async function loginWithGitHub() {
    'use server';
    await signIn('github', { redirectTo: '/' });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">Campo Minado</CardTitle>
          <CardDescription>
            Faça login com o GitHub para jogar e disputar o ranking global.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginWithGitHub}>
            <Button type="submit" className="w-full" size="lg">
              <Github className="h-5 w-5" />
              Entrar com GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
