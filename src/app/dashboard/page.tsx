
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, LogOut, ShieldCheck, UserCog, User as UserIcon, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Placeholder admin emails for UI demonstration
const ADMIN_EMAIL = "admin@gehu.ac.in"; // Keep this if you have a separate admin demo
const SUPER_ADMIN_EMAIL = "pranavm1911@gmail.com"; // Updated for the demo

type UserRole = 'user' | 'admin' | 'superadmin' | 'guest';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        let determinedRole: UserRole = 'user'; 
        if (currentUser.email === SUPER_ADMIN_EMAIL) {
          determinedRole = 'superadmin';
        } else if (currentUser.email === ADMIN_EMAIL) {
          determinedRole = 'admin';
        } else {
          const isGoogleSignIn = currentUser.providerData.some(
            (provider) => provider.providerId === 'google.com'
          );
          // Check if it's the demo super admin email from the special login flow
          const isDemoSuperAdmin = currentUser.uid === 'superadmin-demo-uid' && currentUser.email === SUPER_ADMIN_EMAIL;

          if (isDemoSuperAdmin) {
             determinedRole = 'superadmin';
          } else if (isGoogleSignIn) {
            determinedRole = 'guest';
          } else {
            determinedRole = 'user'; // College ID user
          }
        }
        setUserRole(determinedRole);
      } else {
        // If the special demo super admin "logs out" (which is just a redirect),
        // or if no Firebase user is found, redirect to login.
        // However, the demo super admin doesn't use Firebase `onAuthStateChanged`
        // We'll rely on the login page pushing them here. If they navigate away and back,
        // they might appear logged out if no actual Firebase session exists.
        // For this demo, if `auth.currentUser` is null and it's not the special UID case,
        // we treat it as needing login.
        if (user?.uid !== 'superadmin-demo-uid') { // Check if it's not our mock user
            router.push('/login');
        } else if (!user) { // If there's no user at all
            router.push('/login');
        }
        // If it IS the mock user, but auth.currentUser is null (because it's not a real Firebase session),
        // we need to handle this state. For the demo, we allow them to stay if `user` state is set.
      }
      setLoading(false);
    });
    
    // Handle the case where the page is loaded directly with a mock user from login
    // This is a bit of a hack for the demo super admin login
    if(router.query && router.query.isDemoSuperAdmin && router.query.email === SUPER_ADMIN_EMAIL) {
        const mockSuperAdminUser = {
            uid: 'superadmin-demo-uid',
            email: SUPER_ADMIN_EMAIL,
            displayName: 'Super Admin (Demo)',
            providerData: [{providerId: 'password'}]
        } as User;
        setUser(mockSuperAdminUser);
        setUserRole('superadmin');
        setLoading(false);
    }


    return () => unsubscribe();
  }, [router, user?.uid]); // Added user.uid to dependency array for demo case

  const handleSignOut = async () => {
    try {
      // For the demo super admin, signing out just means redirecting
      // as there's no actual Firebase session to clear for them.
      if (user?.uid === 'superadmin-demo-uid') {
        setUser(null); // Clear local mock user state
        toast({ title: 'Signed Out (Demo)', description: 'Super admin demo session ended.' });
        router.push('/login');
        return;
      }
      
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ title: 'Error', description: 'Failed to sign out. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     // This might still redirect if the page is reloaded and mock user state is lost
     // A more robust demo would use localStorage or similar for mock session persistence
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <p className="mb-4">No user session found. Redirecting to login...</p>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome back, {user.displayName || user.email}!
        </p>
      </header>

      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Details about your current session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Email:</h3>
            <p>{user.email}</p>
          </div>
          {user.displayName && (
            <div>
              <h3 className="font-semibold">Display Name:</h3>
              <p>{user.displayName}</p>
            </div>
          )}
           <div>
            <h3 className="font-semibold">Role:</h3>
            {userRole === 'superadmin' && <Badge variant="destructive"><ShieldCheck className="mr-1 h-3 w-3" />Super Admin</Badge>}
            {userRole === 'admin' && <Badge variant="secondary"><UserCog className="mr-1 h-3 w-3" />Admin</Badge>}
            {userRole === 'user' && <Badge><UserIcon className="mr-1 h-3 w-3" />User</Badge>}
            {userRole === 'guest' && <Badge variant="outline"><Smile className="mr-1 h-3 w-3" />Guest</Badge>}
          </div>
          <div>
            <h3 className="font-semibold">UID:</h3>
            <p className="text-xs break-all">{user.uid}</p>
          </div>
          <Button onClick={handleSignOut} className="w-full mt-4">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
