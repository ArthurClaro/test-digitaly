'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export function LoginButton() {
  return (
    <Button
      type="button"
      className="w-full"
      size="lg"
      onClick={() => signIn('github', { callbackUrl: '/' })}
    >
      <Github className="h-5 w-5" />
      Entrar com GitHub
    </Button>
  );
}
