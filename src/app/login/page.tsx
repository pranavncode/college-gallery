
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, UserCredential, User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, UserCog, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";

// Placeholder Google SVG icon (remains the same)
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const collegeEmailDomains = ["gehu.ac.in", "geu.ac.in"] as const;

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." })
    .refine(email => collegeEmailDomains.some(domain => email.endsWith(`@${domain}`)), {
      message: `Email must end with @gehu.ac.in or @geu.ac.in`,
    }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_SUPER_ADMIN_EMAIL = "pranavm1911@gmail.com";
const DEMO_SUPER_ADMIN_PASSWORD = "1234567";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingCollegeId, setIsLoadingCollegeId] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingSuperAdmin, setIsLoadingSuperAdmin] = useState(false);
  // Admin loading state can be added if/when its logic is implemented

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSuccess = (userCredentialOrUser: UserCredential | User, provider: string) => {
    const user = 'user' in userCredentialOrUser ? userCredentialOrUser.user : userCredentialOrUser;
    console.log(`${provider} Login Successful:`, user);
    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.displayName || user.email}!`,
    });
    router.push("/dashboard"); 
  };

  const handleLoginError = (error: any, provider: string) => {
    console.error(`${provider} Login Error:`, error);
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // For newer Firebase SDK versions
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Google sign-in was cancelled.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This user account has been disabled.';
          break;
        default:
          errorMessage = `Error: ${error.message || error.code}. Please try again.`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    toast({
      title: "Login Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleCollegeIdLogin = async (data: LoginFormValues) => {
    setIsLoadingCollegeId(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      handleLoginSuccess(userCredential, "College ID");
    } catch (error) {
      handleLoginError(error, "College ID");
    } finally {
      setIsLoadingCollegeId(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      handleLoginSuccess(userCredential, "Google");
    } catch (error) {
      handleLoginError(error, "Google");
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAdminLogin = () => {
    console.log("Attempting Admin Login...");
    toast({ title: "Admin Login", description: "Admin login functionality is not yet fully implemented. This is a placeholder." });
    // For a real admin login, you'd authenticate and then check for admin roles/claims.
    // Example: router.push('/admin/dashboard'); 
  };

  const handleSuperAdminLogin = async () => {
    setIsLoadingSuperAdmin(true);
    // THIS IS A HIGHLY INSECURE DEMO - DO NOT USE IN PRODUCTION
    // In a real app, super admin login would go through Firebase Auth
    // and roles would be checked via Custom Claims on the backend.
    
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a mock user object for demonstration purposes
    // This bypasses actual Firebase authentication for this specific demo case
    const mockSuperAdminUser = {
        uid: 'superadmin-demo-uid',
        email: DEMO_SUPER_ADMIN_EMAIL,
        displayName: 'Super Admin (Demo)',
        // Add other user properties if your dashboard/profile page expects them
        providerData: [{providerId: 'password'}] // Mock provider data
    } as User;


    // For the purpose of this demo, we're not actually calling Firebase signIn.
    // We're just creating a mock success state.
    // If you wanted to actually log in a Firebase user with these credentials,
    // they would need to exist in your Firebase Auth.
    // For now, we are just simulating the login success.
    
    handleLoginSuccess(mockSuperAdminUser, "Super Admin (Demo)");
    
    setIsLoadingSuperAdmin(false);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription className="text-md">
            Sign in to connect with ClgGallery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCollegeIdLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Email</FormLabel>
                    <FormControl>
                      <Input placeholder="yourid@gehu.ac.in" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit"
                className="w-full text-base py-6"
                aria-label="Sign in with College ID"
                disabled={isLoadingCollegeId}
              >
                {isLoadingCollegeId ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-3 h-5 w-5" />}
                Sign in with College ID
              </Button>
            </form>
          </Form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin} 
            variant="secondary"
            className="w-full text-base py-6"
            aria-label="Sign in with Google for Guest Access"
            disabled={isLoadingGoogle}
          >
            {isLoadingGoogle ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-3" />}
            Sign in with Google (Guest Access)
          </Button>
          <p className="text-xs text-muted-foreground text-center px-4">
            Guest access is limited. Use your College ID for full features.
          </p>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-3">
              Administrative Access
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={handleAdminLogin} 
                className="w-full text-base py-5"
                aria-label="Sign in as Admin"
              >
                <UserCog className="mr-3 h-5 w-5" />
                Sign in as Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSuperAdminLogin} 
                className="w-full text-base py-5"
                aria-label="Sign in as Super Admin"
                disabled={isLoadingSuperAdmin}
              >
                {isLoadingSuperAdmin ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldAlert className="mr-3 h-5 w-5" />}
                Sign in as Super Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to ClgGallery? <Link href="/signup" className="font-medium text-primary hover:underline">Create an account</Link> (Student/Faculty)
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Ensure Email/Password and Google sign-in methods are enabled in your Firebase project console.
      </p>
    </div>
  );
}
