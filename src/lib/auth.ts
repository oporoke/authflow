import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/validations';
import { getUserByEmail, updateUser, getTwoFactorConfirmationByUserId, getUserById } from '@/lib/data';
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION } from './constants';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login on error
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
    async signIn({ user, account }) {
        // Allow OAuth without email verification
        if (account?.provider !== 'credentials') return true;

        if (!user.id) return false;

        const existingUser = await getUserById(user.id);
        
        // This is a new user signing up. Allow them to sign in.
        if (!existingUser?.emailVerified) {
          if (account?.provider === 'credentials') {
            // This is a bit of a hack to simulate email verification on signup
            // In a real app, you'd send a verification email.
            await db.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() }
            });
            return true;
          }
          return false;
        }
        
        if (existingUser.twoFactorEnabled) {
            const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
            
            if (!twoFactorConfirmation) return false;
            
            // Delete the 2FA confirmation for the next sign in
            await db.twoFactorConfirmation.delete({ where: { id: twoFactorConfirmation.id } });
        }

        return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.twoFactorEnabled = user.twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isTwoFactorEnabled = token.twoFactorEnabled as boolean;
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
