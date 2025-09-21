import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/forms/profile-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserById } from '@/lib/data';

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
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Your Profile</CardTitle>
                    <CardDescription>Manage your account settings and profile information.</CardDescription>
                </CardHeader>
                <ProfileForm user={user} />
            </Card>
        </div>
    );
}
