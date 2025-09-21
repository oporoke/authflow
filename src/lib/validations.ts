import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
  code: z.optional(z.string()),
});

export const SignupSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
});

export const ResetPasswordSchema = z.object({
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters long.',
    }),
    confirmPassword: z.string(),
    token: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const ProfileSchema = z.object({
    username: z.string().min(3, {
        message: 'Username must be at least 3 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
});

export const TwoFactorSchema = z.object({
  code: z.string().length(6, { message: "Your one-time code must be 6 characters." }),
});
