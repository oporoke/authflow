'use client';

import { useSearchParams } from 'next/navigation';
import { TwoFactorForm } from '@/components/forms/two-factor-form';
import { LoginForm } from '@/components/forms/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const showTwoFactor = searchParams.get('twoFactor') === 'true';

  return (
    <>
      {showTwoFactor ? (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Two-Factor Authentication</CardTitle>
            <CardDescription>Enter the code from your authenticator app.</CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorForm />
          </CardContent>
        </Card>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
