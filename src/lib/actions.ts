'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

import {
  SignupSchema,
  ResetPasswordSchema,
  ForgotPasswordSchema,
  ProfileSchema,
  LoginSchema,
  TwoFactorSchema,
} from '@/lib/validations';
import {
  getUserByEmail,
  createPasswordResetToken,
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
  updateUser,
  createUser,
  getTwoFactorTokenByToken,
  deleteTwoFactorToken,
  createTwoFactorToken,
  getTwoFactorConfirmationByUserId,
  deleteTwoFactorConfirmation,
  createTwoFactorConfirmation,
  getUserById,
  getTwoFactorTokenByEmail,
} from '@/lib/data';
import { signIn } from '@/lib/auth';
import { sendPasswordResetEmail, sendWelcomeEmail, sendTwoFactorTokenEmail } from '@/lib/email';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';

type FormState = {
  success?: boolean;
  message: string;
};

export async function signup(values: z.infer<typeof SignupSchema>): Promise<FormState> {
  const validatedFields = SignupSchema.safeParse(values);

  if (!validatedFields.success) {
    return { message: 'Invalid fields.' };
  }

  const { email, password, username } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { message: 'An account with this email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await createUser({
      email,
      username,
      password: hashedPassword,
    });
    
    await sendWelcomeEmail(email, username);

    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });

    return { success: true, message: 'Signup successful! Redirecting...' };
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Signup error:', error);
    return { message: 'An unexpected error occurred.' };
  }
}

export async function login(values: z.infer<typeof LoginSchema>, callbackUrl?: string | null): Promise<FormState & { twoFactor?: boolean }> {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { message: "Invalid fields." };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { message: "Invalid email or password." };
  }

  if (existingUser.lockedUntil && new Date() < new Date(existingUser.lockedUntil)) {
    return { message: `Account locked. Try again after ${new Date(existingUser.lockedUntil).toLocaleTimeString()}.` };
  }

  if (existingUser.twoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { message: 'Invalid 2FA code.' };
      }

      if (new Date(twoFactorToken.expires) < new Date()) {
        await createTwoFactorToken(existingUser.email);
        await sendTwoFactorTokenEmail(existingUser.email, (await getTwoFactorTokenByEmail(existingUser.email))!.token);
        return { message: '2FA code has expired. A new one has been sent.' };
      }
      
      await deleteTwoFactorToken(twoFactorToken.id);

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      if (existingConfirmation) {
        await deleteTwoFactorConfirmation(existingConfirmation.userId);
      }
      await createTwoFactorConfirmation(existingUser.id);
    } else {
        if (!password) {
            return { message: "Password is required." };
        }
        const passwordsMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordsMatch) {
            return { message: "Invalid email or password." };
        }
      const twoFactorToken = await createTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true, message: "2FA code sent to your email." }
    }
  }

  try {
      await signIn('credentials', {
          email,
          password,
          redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
      return { success: true, message: "Logged in successfully!" }
  } catch(error) {
      if (error instanceof AuthError) {
          switch(error.type) {
              case 'CredentialsSignin':
                  return { message: 'Invalid email or password.'}
              default:
                  return { message: 'An error occurred.'}
          }
      }
      if ((error as any).digest?.includes('NEXT_REDIRECT')) {
        throw error;
      }
      return { message: 'An unexpected error occurred.' };
  }
}


export async function forgotPassword(values: z.infer<typeof ForgotPasswordSchema>): Promise<FormState> {
  const validatedFields = ForgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { message: 'Invalid email.' };
  }

  const { email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { message: "If an account with this email exists, a reset link has been sent." };
  }

  const passwordResetToken = await createPasswordResetToken(existingUser.id);
  await sendPasswordResetEmail(
    existingUser.email as string,
    passwordResetToken.token
  );

  return { success: true, message: "If an account with this email exists, a reset link has been sent." };
}

export async function resetPassword(values: z.infer<typeof ResetPasswordSchema>): Promise<FormState> {
  const validatedFields = ResetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { message: 'Invalid fields.' };
  }

  const { password, token } = validatedFields.data;

  if (!token) {
    return { message: 'Missing token.' };
  }

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken || existingToken.used) {
    return { message: 'Invalid or already used token.' };
  }

  if (new Date(existingToken.expiresAt) < new Date()) {
    return { message: 'Token has expired.' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await updateUser(existingToken.userId, { password: hashedPassword });
  await deletePasswordResetToken(existingToken.id);

  return { success: true, message: 'Password has been reset successfully.' };
}

export async function updateProfile(userId: string, values: z.infer<typeof ProfileSchema>): Promise<FormState> {
  const validatedFields = ProfileSchema.safeParse(values);

  if (!validatedFields.success) {
    return { message: 'Invalid fields.' };
  }

  const { username, email } = validatedFields.data;
  
  try {
    await updateUser(userId, { username, email });
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { message: 'An unexpected error occurred.' };
  }
}

export async function generateTwoFactorSecret(userId: string) {
    const user = await getUserById(userId);

    if (!user || !user.email) {
      return { error: "User not found." };
    }

    if (user.twoFactorEnabled) {
      return { error: "2FA is already enabled."};
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'AuthFlow', secret);

    await updateUser(user.id, { twoFactorSecret: secret });

    const qrCode = await qrcode.toDataURL(otpauth);
    
    return { qrCode, secret };
}

export async function enableTwoFactor(userId: string, values: z.infer<typeof TwoFactorSchema>) {
    const user = await getUserById(userId);
    if (!user || !user.twoFactorSecret) {
      return { error: "User or 2FA secret not found." };
    }

    const isValid = authenticator.verify({ token: values.code, secret: user.twoFactorSecret });
    
    if (!isValid) {
      return { error: "Invalid 2FA code." };
    }

    await updateUser(user.id, { twoFactorEnabled: true });
    
    return { success: "2FA enabled successfully." };
}

export async function disableTwoFactor(userId: string) {
    const user = await getUserById(userId);
    if (!user) {
      return { error: "User not found." };
    }

    await updateUser(user.id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
    
    return { success: "2FA disabled successfully." };
}
