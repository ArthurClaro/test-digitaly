import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  trustHost: true,
};
