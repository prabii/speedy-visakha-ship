import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Play, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";

interface GalleryItem {
  _id: string;
  type: 'image' | 'video' | 'youtube' | 'imageUrl';
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
}

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      // Only load gallery category items, exclude pricing images
      const data = await api.gallery.getAll({ category: 'gallery' });
      setItems(data || []);
    } catch (error: any) {
      console.error('Error loading gallery:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // Extract video ID from various YouTube URL formats
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const openItem = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 md:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Gallery</h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of images and videos showcasing our services and operations
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No gallery items available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card
                key={item._id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => openItem(item)}
              >
                <CardContent className="p-0">
                  {item.type === 'youtube' ? (
                    <div className="relative aspect-video bg-gray-100">
                      <img
                        src={getYouTubeThumbnail(item.url) || '/placeholder-video.jpg'}
                        alt={item.title || 'YouTube Video'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  ) : item.type === 'video' ? (
                    <div className="relative aspect-video bg-gray-100">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={item.url}
                        alt={item.title || 'Gallery Image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {(item.title || item.description) && (
                    <div className="p-3 bg-white">
                      {item.title && (
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                      )}
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog for viewing items */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title || 'Gallery Item'}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="mt-4">
                {selectedItem.type === 'youtube' ? (
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedItem.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : selectedItem.type === 'video' ? (
                  <video
                    src={selectedItem.url}
                    controls
                    className="w-full"
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title || 'Gallery Image'}
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {selectedItem.description && (
                  <p className="mt-4 text-muted-foreground">{selectedItem.description}</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default Gallery;
