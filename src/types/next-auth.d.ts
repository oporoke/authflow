import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      isTwoFactorEnabled: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string | null;
    twoFactorEnabled: boolean;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    twoFactorEnabled?: boolean;
  }
}
