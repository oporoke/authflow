'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { LoginSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { login } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

export function TwoFactorForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: email || '',
      password: '', // Password is not needed here, but schema requires it
      code: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
        if (!email) {
            toast({ title: 'Error', description: 'Email not found.', variant: 'destructive' });
            return;
        }
        // We need to pass the password, but it's not used in the 2FA step
        // A better implementation might separate the logic more cleanly
        const loginValues = {
            email,
            password: 'dummy-password-for-validation', // This won't be checked
            code: values.code
        }

      login(loginValues, callbackUrl)
        .then((data) => {
          if (data?.message && !data.success) {
            toast({
              title: 'Verification Failed',
              description: data.message,
              variant: 'destructive',
            });
            form.reset();
          }
        })
        .catch(() => {
            toast({
              title: 'Error',
              description: 'An unexpected error occurred.',
              variant: 'destructive',
            });
        });
    });
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} disabled={isPending} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
        </form>
      </Form>
  );
}
