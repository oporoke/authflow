import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/validations';
import { getUserByEmail, updateUser } from '@/lib/data';
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION } from './constants';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
             throw new Error(`Account locked. Try again after ${new Date(user.lockedUntil).toLocaleTimeString()}.`);
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            if (user.failedLoginAttempts > 0) {
              await updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null });
            }
            return user;
          } else {
            const newAttempts = (user.failedLoginAttempts || 0) + 1;
            let lockedUntil = null;
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
            }
            await updateUser(user.id, { failedLoginAttempts: newAttempts, lockedUntil });

            if (lockedUntil) {
                 throw new Error(`Account locked. Try again after ${lockedUntil.toLocaleTimeString()}.`);
            }

            return null;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  events: {
      async linkAccount({ user }) {
          await db.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() }
          })
      }
  }
});
