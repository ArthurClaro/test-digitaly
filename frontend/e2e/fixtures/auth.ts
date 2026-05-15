import { test as base, type BrowserContext } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ?? '4rf0dhDV5eOXzpKFHLhCN9yEftMn88IUcd93u4LdDH4=';
const BASE_URL = process.env.TEST_FRONTEND_URL ?? 'http://127.0.0.1:3050';

export const TEST_USER = {
  sub: 'gh|e2e-99999',
  name: 'E2E Tester',
  email: 'e2e@digitaly.test',
  picture: 'https://avatars.githubusercontent.com/u/99999',
} as const;

export async function injectAuthCookies(context: BrowserContext): Promise<void> {
  const backendJwt = jwt.sign(
    {
      sub: TEST_USER.sub,
      name: TEST_USER.name,
      email: TEST_USER.email,
      picture: TEST_USER.picture,
    },
    NEXTAUTH_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' },
  );

  const sessionToken = await encode({
    token: {
      sub: TEST_USER.sub,
      name: TEST_USER.name,
      email: TEST_USER.email,
      picture: TEST_USER.picture,
      backendJwt,
    },
    secret: NEXTAUTH_SECRET,
    salt: 'authjs.session-token',
    maxAge: 60 * 60,
  });

  await context.addCookies([
    {
      name: 'authjs.session-token',
      value: sessionToken,
      url: BASE_URL,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

export const test = base.extend<{ authedContext: BrowserContext }>({
  authedContext: async ({ context }, use) => {
    await injectAuthCookies(context);
    await use(context);
  },
});

export { expect } from '@playwright/test';
