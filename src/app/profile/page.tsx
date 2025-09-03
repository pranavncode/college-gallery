
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, LogOut, Edit, ShieldCheck, UserCog, User as UserIcon, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Placeholder admin emails for UI demonstration
const ADMIN_EMAIL = "admin@gehu.ac.in"; // Keep this if you have a separate admin demo
const SUPER_ADMIN_EMAIL = "pranavm1911@gmail.com"; // Updated for the demo

type UserRole = 'user' | 'admin' | 'superadmin' | 'guest';

export default function ProfilePage() {
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
            determinedRole = 'user'; 
          }
        }
        setUserRole(determinedRole);
      } else {
        // Similar logic to dashboard for demo super admin
        if (user?.uid !== 'superadmin-demo-uid') {
            router.push('/login');
        } else if (!user) {
            router.push('/login');
        }
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
  }, [router, user?.uid]);

  const handleSignOut = async () => {
    try {
      if (user?.uid === 'superadmin-demo-uid') {
        setUser(null); 
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

  const getAvatarFallback = () => {
    if (user?.displayName) {
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const getRoleGreeting = () => {
    switch(userRole) {
      case 'admin': return 'Admin';
      case 'superadmin': return 'Super Admin';
      case 'guest': return 'Guest';
      case 'user': return 'User';
      default: return 'User';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
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
        <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Hi, {getRoleGreeting()}! Manage your account details here.
        </p>
      </header>

      <div className="flex flex-col items-center space-y-6">
        <Avatar className="h-24 w-24 border-2 border-primary">
          {user.photoURL ? (
             <AvatarImage src={user.photoURL} alt={user.displayName || 'User Avatar'} />
          ) : null}
          <AvatarFallback className="text-3xl bg-muted">{getAvatarFallback()}</AvatarFallback>
        </Avatar>

        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal and account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.displayName && (
              <div>
                <h3 className="font-semibold">Full Name:</h3>
                <p>{user.displayName}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold">Email:</h3>
              <p>{user.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Role:</h3>
              {userRole === 'superadmin' && <Badge variant="destructive"><ShieldCheck className="mr-1 h-3 w-3" />Super Admin</Badge>}
              {userRole === 'admin' && <Badge variant="secondary"><UserCog className="mr-1 h-3 w-3" />Admin</Badge>}
              {userRole === 'user' && <Badge><UserIcon className="mr-1 h-3 w-3" />User</Badge>}
              {userRole === 'guest' && <Badge variant="outline"><Smile className="mr-1 h-3 w-3" />Guest</Badge>}
            </div>
            <div>
              <h3 className="font-semibold">User ID:</h3>
              <p className="text-xs break-all">{user.uid}</p>
            </div>
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => toast({ title: 'Edit Profile Clicked', description: 'Profile editing functionality TBD.'})}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
              <Button onClick={handleSignOut} className="flex-grow">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
