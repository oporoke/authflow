'use client';

import { useState, useTransition } from 'react';
import type { User } from '@prisma/client';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor } from '@/lib/actions';
import { Loader2, QrCode } from 'lucide-react';
import { TwoFactorSchema } from '@/lib/validations';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

interface TwoFactorAuthCardProps {
  user: User;
}

export function TwoFactorAuthCard({ user }: TwoFactorAuthCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof TwoFactorSchema>>({
    resolver: zodResolver(TwoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  const handleGenerateSecret = () => {
    startTransition(async () => {
      const result = await generateTwoFactorSecret(user.id);
      if (result.qrCode && result.secret) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setIsDialogOpen(true);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };
  
  const onSubmit = (values: z.infer<typeof TwoFactorSchema>) => {
    startTransition(async () => {
      const result = await enableTwoFactor(user.id, values);
      if (result.success) {
        toast({ title: 'Success', description: result.success });
        setIsDialogOpen(false);
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
        form.reset();
      }
    });
  };

  const handleDisable2FA = () => {
    startTransition(async () => {
        const result = await disableTwoFactor(user.id);
        if (result.success) {
            toast({ title: 'Success', description: result.success });
            router.refresh();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user.twoFactorEnabled ? (
          <p className="text-sm text-muted-foreground">Two-factor authentication is currently enabled.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            You have not enabled two-factor authentication.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {user.twoFactorEnabled ? (
            <Button onClick={handleDisable2FA} variant="destructive" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable 2FA
            </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleGenerateSecret} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enable 2FA
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Scan the QR code with your authenticator app, then enter the code below to verify.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                {qrCode ? (
                  <Image src={qrCode} alt="QR Code" width={200} height={200} />
                ) : (
                  <div className="flex h-[200px] w-[200px] items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Or enter this secret manually: <span className="font-mono bg-muted p-1 rounded-md">{secret}</span>
                </p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Enable
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
