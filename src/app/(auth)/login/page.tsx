import { LoginPageClient } from '@/components/auth/login-page-client';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPageClient />
      </Suspense>
    </div>
  );
}
