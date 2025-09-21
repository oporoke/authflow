import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 md:p-8">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
          Welcome to <span className="text-primary">AuthFlow</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
          A seamless and secure authentication experience, built with the latest technologies.
          Sign up, log in, and manage your profile with ease.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {session?.user ? (
            <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">Already have an account?</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <FeatureCard
          icon={<ShieldCheck className="w-8 h-8 text-primary" />}
          title="Secure by Design"
          description="Your data is protected with industry-standard password hashing, secure sessions, and CSRF protection."
        />
        <FeatureCard
          icon={<CheckCircle className="w-8 h-8 text-primary" />}
          title="Modern Stack"
          description="Built on Next.js 14, Prisma, and NextAuth.js for a fast, reliable, and scalable application."
        />
        <FeatureCard
          icon={<BrainCircuit className="w-8 h-8 text-primary" />}
          title="AI-Powered Tools"
          description="Leverage our GenAI-powered form validator to get suggestions for improving user experience."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-primary/20">
      <CardHeader className="items-center">
        {icon}
        <CardTitle className="mt-4 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
