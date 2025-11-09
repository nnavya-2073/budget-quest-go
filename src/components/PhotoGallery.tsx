import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Image as ImageIcon, Heart } from "lucide-react";
import { toast } from "sonner";

interface PhotoGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationName: string;
  city: string;
}

export const PhotoGallery = ({ open, onOpenChange, destinationName, city }: PhotoGalleryProps) => {
  const [savedPhotos, setSavedPhotos] = useState<number[]>([]);

  // Sample photos - in production, these would come from an API
  const photos = [
    {
      id: 1,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},landmark`,
      title: `${destinationName} Landmark`,
      description: "Iconic landmark view"
    },
    {
      id: 2,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},street`,
      title: `${destinationName} Streets`,
      description: "Local street scene"
    },
    {
      id: 3,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},food`,
      title: `${destinationName} Cuisine`,
      description: "Local food and cuisine"
    },
    {
      id: 4,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},culture`,
      title: `${destinationName} Culture`,
      description: "Cultural attractions"
    },
    {
      id: 5,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},architecture`,
      title: `${destinationName} Architecture`,
      description: "Architectural highlights"
    },
    {
      id: 6,
      url: `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},sunset`,
      title: `${destinationName} Sunset`,
      description: "Beautiful sunset views"
    },
  ];

  const handleSavePhoto = (photoId: number) => {
    if (savedPhotos.includes(photoId)) {
      setSavedPhotos(savedPhotos.filter(id => id !== photoId));
      toast.success("Photo removed from saved");
    } else {
      setSavedPhotos([...savedPhotos, photoId]);
      toast.success("Photo saved to your collection");
    }
  };

  const handleDownload = (url: string, title: string) => {
    // In production, this would trigger an actual download
    toast.success(`Downloading ${title}...`);
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Photo Gallery - {destinationName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group relative">
              <div className="relative aspect-video">
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSavePhoto(photo.id)}
                    className="gap-2"
                  >
                    <Heart 
                      className={`w-4 h-4 ${savedPhotos.includes(photo.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    {savedPhotos.includes(photo.id) ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(photo.url, photo.title)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm">{photo.title}</h3>
                <p className="text-xs text-muted-foreground">{photo.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {savedPhotos.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold">
              {savedPhotos.length} photo{savedPhotos.length > 1 ? 's' : ''} saved to your collection
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
