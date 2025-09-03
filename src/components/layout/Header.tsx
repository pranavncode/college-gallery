
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Image as GalleryIcon, CalendarDays, LogIn, Bell, CalendarCheck, UserRound } from "lucide-react";
import { CollegeGalleryLogo } from "@/components/icons/CollegeGalleryLogo";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

// Nav items for the main navigation (center part on desktop)
const baseNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "Gallery", icon: GalleryIcon },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/my-events", label: "My Events", icon: CalendarCheck },
];

// Nav items for authenticated users (added in mobile menu)
const authenticatedMobileNavItems = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
];


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


  const NavLink = ({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: React.ElementType; onClick?: () => void; }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        pathname === href ? "bg-accent text-accent-foreground" : "text-foreground/80"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo Placeholder */}
          <div className="animate-pulse bg-muted h-8 w-36 rounded-md"></div>
          
          {/* Desktop Nav Placeholder (4 items) */}
          <div className="hidden md:flex items-center gap-1">
            <div className="animate-pulse bg-muted h-9 w-20 rounded-md"></div>
            <div className="animate-pulse bg-muted h-9 w-20 rounded-md"></div>
            <div className="animate-pulse bg-muted h-9 w-20 rounded-md"></div>
            <div className="animate-pulse bg-muted h-9 w-20 rounded-md"></div>
          </div>
          
          {/* Right Side Buttons Placeholder */}
          <div className="flex items-center gap-2">
            <div className="animate-pulse bg-muted h-9 w-9 rounded-md"></div> {/* Bell icon placeholder */}
            <div className="animate-pulse bg-muted h-9 w-24 rounded-md"></div> {/* Login/Profile button placeholder */}
            <div className="animate-pulse bg-muted h-9 w-9 rounded-md md:hidden"></div> {/* Mobile Menu Trigger Placeholder */}
          </div>
        </div>
      </header>
    );
  }

  const mobileNavItems = [...baseNavItems];
  if (currentUser) {
    mobileNavItems.push(...authenticatedMobileNavItems);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="ClgGallery Home">
          <CollegeGalleryLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {baseNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/notifications" passHref>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          {currentUser ? (
            <Link href="/profile" passHref>
              <Button variant="ghost" size="icon" aria-label="Profile">
                <UserRound className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login" passHref>
              <Button variant="outline" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open mobile menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs p-6">
                <div className="flex flex-col gap-4">
                  <Link href="/" className="mb-4 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <CollegeGalleryLogo />
                  </Link>
                  {mobileNavItems.map((item) => (
                     <NavLink key={item.href} {...item} onClick={() => setIsMobileMenuOpen(false)} />
                  ))}
                  {!currentUser && (
                     <NavLink href="/login" label="Login" icon={LogIn} onClick={() => setIsMobileMenuOpen(false)} />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
