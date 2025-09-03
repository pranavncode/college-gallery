
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemoryImage } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Tag, Trash2, Edit } from "lucide-react"; // Added Edit for future, Trash2 for delete
import { Button } from "@/components/ui/button"; // Added Button
import { useToast } from "@/hooks/use-toast"; // Added useToast

interface ImageCardProps {
  image: MemoryImage;
  canManage?: boolean; // Optional prop to control visibility of admin actions
  onDelete?: () => void; // Callback for delete action
  onEdit?: () => void; // Callback for edit action (optional for now)
}

export function ImageCard({ image, canManage, onDelete, onEdit }: ImageCardProps) {
  const { toast } = useToast(); // Initialize toast for placeholders

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      // Fallback if onDelete is not provided, though it should be from GalleryPage
      toast({
        title: "Delete Action (Placeholder)",
        description: `Delete clicked for ${image.title}. Configure onDelete prop.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
        onEdit();
    } else {
        toast({
            title: "Edit Action (Placeholder)",
            description: `Edit clicked for ${image.title}. Configure onEdit prop.`
        });
    }
  }


  return (
    <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-105 duration-300 ease-in-out group flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={image.dataAiHint}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-2 truncate group-hover:text-primary">{image.title}</CardTitle>
        <div className="flex flex-wrap gap-1">
          {image.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </Badge>
          ))}
          {image.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{image.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      {canManage && (
        <CardFooter className="p-4 pt-0 border-t mt-auto">
          <div className="flex gap-2 w-full justify-end">
            {/* <Button size="sm" variant="outline" onClick={handleEdit}>
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Button> */}
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
