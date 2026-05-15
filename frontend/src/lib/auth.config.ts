import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
  providers: [GitHub],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
};
