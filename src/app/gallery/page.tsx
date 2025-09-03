
'use client';

import React, { useEffect, useState } from 'react'; 
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useSearchParams and useRouter
import { ImageCard } from "@/components/gallery/ImageCard";
import { placeholderImages, MemoryImage } from "@/lib/constants"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, UploadCloud, ImageIcon as GalleryIconPlaceholder, ImagePlus, X, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image'; 
import { AiAssistant } from '@/components/gallery/AiAssistant'; 

const ADMIN_EMAIL = "admin@gehu.ac.in";
const SUPER_ADMIN_EMAIL = "pranavm1911@gmail.com"; 

type UserRole = 'user' | 'admin' | 'superadmin' | 'guest'; 

interface NewImageUpload {
  title: string;
  tags: string; 
  file: File | null;
  dataAiHint: string;
}

const defaultNewImage: NewImageUpload = {
  title: '',
  tags: '',
  file: null,
  dataAiHint: 'gallery image',
};

export default function GalleryPage() {
  const [images, setImages] = useState<MemoryImage[]>(placeholderImages); 
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest'); 
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newImageData, setNewImageData] = useState<NewImageUpload>(defaultNewImage);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const searchParams = useSearchParams();
  // const router = useRouter(); // Only needed if redirecting

  useEffect(() => {
    let isDemoSessionActive = false;
    const demoQueryParam = searchParams.get('isDemoSuperAdmin');
    const emailQueryParam = searchParams.get('email');

    if (demoQueryParam === 'true' && emailQueryParam === SUPER_ADMIN_EMAIL) {
      const mockSuperAdminUser = {
        uid: 'superadmin-demo-uid',
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Super Admin (Demo)',
        providerData: [{ providerId: 'password' }]
      } as User;
      setUser(mockSuperAdminUser);
      setUserRole('superadmin');
      isDemoSessionActive = true;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email === SUPER_ADMIN_EMAIL) {
            setUser(firebaseUser);
            setUserRole('superadmin');
        } else if (firebaseUser.email === ADMIN_EMAIL) {
            setUser(firebaseUser);
            setUserRole('admin');
        } else if (!isDemoSessionActive) {
            setUser(firebaseUser);
            const isGoogleSignIn = firebaseUser.providerData.some(
                (provider) => provider.providerId === 'google.com'
            );
            setUserRole(isGoogleSignIn ? 'guest' : 'user');
        }
      } else {
        if (!isDemoSessionActive) {
          setUser(null);
          setUserRole('guest');
        }
      }
    });
    return () => unsubscribe();
  }, [searchParams]);


  const handleOpenUploadDialog = () => {
    setNewImageData(defaultNewImage);
    setPreviewUrl(null);
    setIsUploadDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImageData(prev => ({ ...prev, file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewImageData(prev => ({ ...prev, file: null }));
      setPreviewUrl(null);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewImageData(prev => ({ ...prev, [name]: value }));
  };

  const handleActualUpload = async () => {
    if (!previewUrl) { // Check for previewUrl instead of newImageData.file for local state demo
      toast({ title: "No File Selected", description: "Please select an image file to upload.", variant: "destructive" });
      return;
    }
    if (!newImageData.title) {
      toast({ title: "Title Missing", description: "Please provide a title for the image.", variant: "destructive" });
      return;
    }

    const newImage: MemoryImage = {
      id: `img-${Date.now()}`,
      src: previewUrl, // Use previewUrl for local display
      alt: newImageData.title,
      title: newImageData.title,
      tags: newImageData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      dataAiHint: newImageData.dataAiHint || 'gallery image',
    };

    setImages(prevImages => [newImage, ...prevImages]); // Add to beginning for visibility
    
    toast({
      title: "Image Added (Locally)",
      description: `Image "${newImageData.title}" has been added to the gallery view.`,
    });
    
    setIsUploadDialogOpen(false); 
    setNewImageData(defaultNewImage);
    setPreviewUrl(null);
  };

  const handleDeleteImage = (imageId: string, imageTitle: string) => {
    setImages(prevImages => prevImages.filter(img => img.id !== imageId));
    toast({
      title: "Image Deleted (Locally)",
      description: `Image "${imageTitle}" has been removed from the gallery view.`,
      variant: "destructive",
    });
  };

  const canManageGallery = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Campus Memories</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore moments captured across campus.
        </p>
      </header>

      <div className="sticky top-16 bg-background/90 py-4 z-10 rounded-md shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-card">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Search by tags or title..." className="pl-10 w-full" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="scenery">Scenery</SelectItem>
              <SelectItem value="student-life">Student Life</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Grid view">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="List view">
              <List className="h-5 w-5" />
            </Button>
          </div>
          {canManageGallery && (
            <Button onClick={handleOpenUploadDialog}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          )}
        </div>
      </div>
      
      {/* Image Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Upload New Image</DialogTitle>
            <DialogDescription>
              Select an image file and provide details. Click upload when ready.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Image File</Label>
              <Input id="file" type="file" accept="image/*" onChange={handleFileChange} className="h-auto p-2"/>
              {previewUrl && (
                <div className="mt-2 relative border rounded-md overflow-hidden aspect-video w-full max-w-xs mx-auto">
                  <Image src={previewUrl} alt="Image preview" layout="fill" objectFit="contain" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white h-6 w-6"
                    onClick={() => { setPreviewUrl(null); setNewImageData(prev => ({...prev, file: null})); const fileInput = document.getElementById('file') as HTMLInputElement; if(fileInput) fileInput.value = '';}}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Image Title</Label>
              <Input id="title" name="title" value={newImageData.title} onChange={handleInputChange} placeholder="e.g., Graduation Day Fun" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" value={newImageData.tags} onChange={handleInputChange} placeholder="e.g., event, students, graduation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataAiHint">AI Hint for Poster (optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" value={newImageData.dataAiHint} onChange={handleInputChange} placeholder="e.g., group photo" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleActualUpload}>
              <ImagePlus className="mr-2 h-4 w-4" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <ImageCard 
              key={image.id} 
              image={image} 
              canManage={canManageGallery}
              onDelete={() => handleDeleteImage(image.id, image.title)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GalleryIconPlaceholder className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Memories Yet</h3>
          <p className="mt-1 text-muted-foreground">
            Check back soon {canManageGallery ? "or upload the first memory!" : "for updates."}
          </p>
          {canManageGallery && (
             <Button onClick={handleOpenUploadDialog} className="mt-4">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload First Image
            </Button>
          )}
        </div>
      )}
      <AiAssistant galleryImages={images} /> 
    </div>
  );
}


    