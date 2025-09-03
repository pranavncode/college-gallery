
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, UserCredential } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";

const collegeEmailDomains = ["gehu.ac.in", "geu.ac.in"] as const;

const signupSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }).optional(),
  email: z.string().email({ message: "Invalid email address." })
    .refine(email => collegeEmailDomains.some(domain => email.endsWith(`@${domain}`)), {
      message: `Email must end with @gehu.ac.in or @geu.ac.in`,
    }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password confirmation is required." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Set error on confirmPassword field
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignupSuccess = async (userCredential: UserCredential, fullName?: string) => {
    if (fullName && userCredential.user) {
      try {
        await updateProfile(userCredential.user, { displayName: fullName });
      } catch (error) {
        console.error("Error updating profile:", error);
        // Non-critical, so we don't necessarily need to show an error to the user here
      }
    }
    console.log("Signup Successful:", userCredential.user);
    toast({
      title: "Account Created Successfully!",
      description: `Welcome, ${userCredential.user.email}! You can now log in.`,
    });
    router.push("/dashboard"); // Redirect to dashboard after successful signup
  };

  const handleSignupError = (error: any) => {
    console.error("Signup Error:", error);
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }
    toast({
      title: "Signup Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleSignup = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await handleSignupSuccess(userCredential, data.fullName);
    } catch (error) {
      handleSignupError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription className="text-md">
            Join ClgGallery by creating a student or faculty account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Email</FormLabel>
                    <FormControl>
                      <Input placeholder="yourid@gehu.ac.in or yourid@geu.ac.in" {...field} />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
                aria-label="Create Account"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-3 h-5 w-5" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in here</Link>
      </p>
    </div>
  );
}
