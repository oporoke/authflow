'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

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

const TwoFactorCodeSchema = z.object({
  code: z.string().length(6, { message: "Your one-time code must be 6 characters." }),
});

export function TwoFactorForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof TwoFactorCodeSchema>>({
    resolver: zodResolver(TwoFactorCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = (values: z.infer<typeof TwoFactorCodeSchema>) => {
    startTransition(() => {
        if (!email) {
            toast({ title: 'Error', description: 'Email not found.', variant: 'destructive' });
            return;
        }

        const loginValues = {
            email,
            password: '', // Password is not needed here
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
