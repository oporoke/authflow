import Link from 'next/link';
import type { Session } from 'next-auth';
import { SignInButton, UserNav } from '@/components/auth-components';
import Logo from '@/components/logo';

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
