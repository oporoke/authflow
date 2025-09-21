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
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
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


// 2FA TOKEN FUNCTIONS
export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    return await db.twoFactorToken.findUnique({ where: { token } });
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
    try {
        return await db.twoFactorToken.findFirst({ where: { email } });
    } catch {
        return null;
    }
}

export const createTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({ where: { id: existingToken.id } });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: { email, token, expires },
  });

  return twoFactorToken;
};

export const deleteTwoFactorToken = async (id: string) => {
    await db.twoFactorToken.delete({ where: { id } });
}


// 2FA CONFIRMATION FUNCTIONS
export const getTwoFactorConfirmationByUserId = async (userId: string) => {
    try {
        return await db.twoFactorConfirmation.findUnique({ where: { userId } });
    } catch {
        return null;
    }
}

export const createTwoFactorConfirmation = async (userId: string) => {
    return await db.twoFactorConfirmation.create({ data: { userId } });
}

export const deleteTwoFactorConfirmation = async (userId: string) => {
    await db.twoFactorConfirmation.delete({ where: { userId } });
}
