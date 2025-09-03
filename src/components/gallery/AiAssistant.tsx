
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { imageTagging, ImageTaggingInput } from '@/ai/flows/image-tagging';
import type { MemoryImage } from '@/lib/constants';
import { ImageCard } from './ImageCard'; // To display related images

interface AiAssistantProps {
  galleryImages: MemoryImage[];
}

export function AiAssistant({ galleryImages }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTags, setAnalysisTags] = useState<string[]>([]);
  const [relatedImages, setRelatedImages] = useState<MemoryImage[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisTags([]);
      setRelatedImages([]);
    } else {
      setUploadedFile(null);
      setPreviewUrl(null);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysisTags([]);
    setRelatedImages([]);
    const fileInput = document.getElementById('ai-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const handleAnalyzeImage = async () => {
    if (!uploadedFile || !previewUrl) {
      toast({ title: 'No Image', description: 'Please upload an image to analyze.', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisTags([]);
    setRelatedImages([]);

    try {
      const input: ImageTaggingInput = { photoDataUri: previewUrl };
      const result = await imageTagging(input);
      
      if (result && result.tags) {
        setAnalysisTags(result.tags);
        toast({ title: 'Analysis Complete', description: `Found tags: ${result.tags.join(', ')}` });

        // Find related images from galleryImages
        const newRelatedImages = galleryImages.filter(galleryImg => 
          galleryImg.tags.some(tag => result.tags.includes(tag))
        );
        setRelatedImages(newRelatedImages);

      } else {
        toast({ title: 'Analysis Failed', description: 'Could not retrieve tags for the image.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({ title: 'Analysis Error', description: 'An error occurred while analyzing the image.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg p-4 h-auto aspect-square"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>AI Image Assistant</SheetTitle>
            <SheetDescription>
              Upload an image to find related content in the gallery based on AI-generated tags.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-grow overflow-y-auto">
            {/* Left Panel: Upload and Preview */}
            <div className="space-y-4 p-2 border-r-0 md:border-r pr-0 md:pr-4">
              <div>
                <Label htmlFor="ai-image-upload" className="mb-2 block">Upload Image</Label>
                <Input id="ai-image-upload" type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {previewUrl && (
                <div className="mt-4 space-y-2">
                  <Label>Preview:</Label>
                  <div className="relative border rounded-md overflow-hidden aspect-video w-full max-w-md mx-auto">
                    <Image src={previewUrl} alt="Uploaded preview" layout="fill" objectFit="contain" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white h-6 w-6"
                      onClick={resetUpload}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={handleAnalyzeImage} disabled={!uploadedFile || isAnalyzing} className="w-full mt-4">
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Image & Find Related
              </Button>

              {analysisTags.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h4 className="font-semibold mb-1">Generated Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysisTags.map(tag => <span key={tag} className="px-2 py-0.5 bg-primary/20 text-primary-foreground text-xs rounded-full">{tag}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Related Images */}
            <div className="space-y-4 p-2">
              <h3 className="text-lg font-semibold">Related Images in Gallery</h3>
              {isAnalyzing && (
                 <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Searching gallery...</p>
                 </div>
              )}
              {!isAnalyzing && relatedImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  {relatedImages.map(img => (
                    <div key={img.id} className="transform scale-90"> {/* Scale down for smaller display in sheet */}
                       <ImageCard image={img} />
                    </div>
                  ))}
                </div>
              )}
              {!isAnalyzing && relatedImages.length === 0 && analysisTags.length > 0 && (
                <div className="text-center py-6 bg-muted/30 rounded-md border border-dashed">
                  <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-sm text-muted-foreground">No related images found in the gallery for these tags.</p>
                </div>
              )}
               {!isAnalyzing && analysisTags.length === 0 && !uploadedFile && (
                 <div className="text-center py-6 bg-muted/30 rounded-md border border-dashed">
                  <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-sm text-muted-foreground">Upload an image and click "Analyze" to see related content.</p>
                </div>
               )}
            </div>
          </div>

          <SheetFooter className="mt-auto pt-4 border-t">
            <SheetClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
