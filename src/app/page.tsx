
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/gallery/ImageCard";
import { placeholderImages } from "@/lib/constants";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  const featuredMemories = placeholderImages.slice(0, 3);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-card rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to ClgGallery
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Relive your best college moments. Share, discover, and connect with campus memories and events, all in one place.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/gallery">
                View Gallery <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/events">
                See Events <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Featured Memories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMemories.map((image) => (
            <ImageCard key={image.id} image={image} canManage={false} /> // Assuming general users can't manage featured memories here
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/gallery">Explore All Memories &rarr;</Link>
          </Button>
        </div>
      </section>

      {!loadingAuth && !currentUser && (
        <section className="text-center py-12 bg-secondary/20 rounded-lg">
           <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
                  Never miss an event. Our platform keeps you informed about all happenings on campus.
              </p>
              <Button asChild>
                  <Link href="/login">
                      Login / Sign Up
                  </Link>
              </Button>
          </div>
        </section>
      )}
    </div>
  );
}
