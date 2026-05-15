import NextAuth from 'next-auth';
import jwt from 'jsonwebtoken';
import { authConfig } from './auth.config';

const JWT_ALGORITHM = 'HS256' as const;
const JWT_EXPIRES_IN = '7d';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.sub = String(profile.id ?? token.sub);
        const avatar = (profile as { avatar_url?: string }).avatar_url;
        if (avatar) {
          token.picture = avatar;
        }
        const secret = process.env.NEXTAUTH_SECRET;
        if (secret && token.sub) {
          token.backendJwt = jwt.sign(
            {
              sub: token.sub,
              name: token.name,
              email: token.email,
              picture: token.picture,
            },
            secret,
            { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN },
          );
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.backendJwt = token.backendJwt;
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    },
  },
});
