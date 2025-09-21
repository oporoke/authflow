import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/forms/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserById } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { TwoFactorAuthCard } from '@/components/cards/two-factor-auth-card';

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }
    
    const user = await getUserById(session.user.id);

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Your Profile</CardTitle>
                    <CardDescription>Manage your account settings and profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user} />
                </CardContent>
            </Card>

            <TwoFactorAuthCard user={user} />
        </div>
    );
}
