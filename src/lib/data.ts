import { db } from '@/lib/db';
import crypto from 'crypto';

// USER FUNCTIONS
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export const createUser = async (data: { email: string; username: string; password: string }) => {
    return db.user.create({ data });
}

export const updateUser = async (id: string, data: Partial<{
    username: string;
    email: string;
    password: string;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
}>) => {
    return db.user.update({ where: { id }, data });
}


// PASSWORD RESET TOKEN FUNCTIONS
export const createPasswordResetToken = async (userId: string) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return passwordResetToken;
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });
    return passwordResetToken;
  } catch {
    return null;
  }
};

export const deletePasswordResetToken = async (id: string) => {
  await db.passwordResetToken.delete({
    where: { id },
  });
};
