import Link from 'next/link';
import type { Session } from 'next-auth';
import Logo from '@/components/logo';
import dynamic from 'next/dynamic';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const UserNav = dynamic(() => import('@/components/auth-components').then(mod => mod.UserNav), {
  loading: () => <Skeleton className="h-9 w-9 rounded-full" />,
  ssr: false,
});

const SignInButton = dynamic(() => import('@/components/auth-components').then(mod => mod.SignInButton), {
  loading: () => <Button disabled>Sign In</Button>,
  ssr: false,
});


export default function Header({ session }: { session: Session | null }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session ? <UserNav session={session} /> : <SignInButton />}
          </nav>
        </div>
      </div>
    </header>
  );
}
