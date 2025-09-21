'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

import {
  SignupSchema,
  ResetPasswordSchema,
  ForgotPasswordSchema,
  ProfileSchema,
  LoginSchema,
} from '@/lib/validations';
import {
  getUserByEmail,
  createPasswordResetToken,
  getPasswordResetTokenByToken,
  deletePasswordResetToken,
  updateUser,
  createUser,
} from '@/lib/data';
import { signIn } from '@/lib/auth';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email';
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

export async function login(values: z.infer<typeof LoginSchema>, callbackUrl?: string | null): Promise<FormState> {
    try {
        await signIn('credentials', {
            email: values.email,
            password: values.password,
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
        throw error;
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
    existingUser.email,
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
