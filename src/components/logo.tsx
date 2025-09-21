import { Lock } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center justify-center font-bold font-headline text-lg text-primary">
       <Lock className="h-6 w-6 mr-2" />
      <span className="text-foreground">Auth</span>
      <span>Flow</span>
    </div>
  );
}
