import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <div className="flex flex-col space-y-4">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {session.user.username || session.user.name}!</CardTitle>
                        <CardDescription>This is your protected dashboard. You can only see this if you are logged in.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Here you can find an overview of your account and quick links to manage your profile.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
