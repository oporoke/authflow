import { TwoFactorForm } from '@/components/forms/two-factor-form';
import { LoginForm } from '@/components/forms/login-form';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage({ searchParams }: { searchParams: { twoFactor?: string }}) {
  const showTwoFactor = searchParams.twoFactor === 'true';
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </div>
  );
}
