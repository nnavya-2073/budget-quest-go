import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Facebook, Twitter, Mail, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareTripProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: {
    name: string;
    city: string;
    state: string;
    cost: number;
    duration: string;
    rating: number;
  };
  itinerary?: Array<{ day: number; activities: string[] }>;
  budgetBreakdown?: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
}

export const ShareTrip = ({ open, onOpenChange, destination, itinerary, budgetBreakdown }: ShareTripProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = window.location.href;
  
  // Build detailed share text with itinerary and budget
  let shareText = `🌍 Trip to ${destination.name}, ${destination.state}\n\n`;
  shareText += `📅 Duration: ${destination.duration}\n`;
  shareText += `💰 Budget: ₹${destination.cost.toLocaleString('en-IN')}\n`;
  shareText += `⭐ Rating: ${destination.rating}/5\n`;
  
  if (budgetBreakdown) {
    shareText += `\n💵 Budget Breakdown:\n`;
    shareText += `  • Accommodation: ₹${budgetBreakdown.accommodation.toLocaleString('en-IN')}\n`;
    shareText += `  • Food: ₹${budgetBreakdown.food.toLocaleString('en-IN')}\n`;
    shareText += `  • Transport: ₹${budgetBreakdown.transport.toLocaleString('en-IN')}\n`;
    shareText += `  • Activities: ₹${budgetBreakdown.activities.toLocaleString('en-IN')}\n`;
  }
  
  if (itinerary && itinerary.length > 0) {
    shareText += `\n📋 Itinerary:\n`;
    itinerary.slice(0, 3).forEach(day => {
      shareText += `  Day ${day.day}: ${day.activities.slice(0, 2).join(', ')}\n`;
    });
    if (itinerary.length > 3) {
      shareText += `  ...and more!\n`;
    }
  }
  
  shareText += `\n🔗 View full details:`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: string) => {
    let url = '';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`Trip Plan: ${destination.name}`)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const downloadItinerary = () => {
    const content = shareText + `\n\n${shareUrl}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${destination.name}-trip-plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Trip plan downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Trip Plan
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Share this complete trip plan:</p>
              <p className="font-semibold mb-4">{destination.name}, {destination.state}</p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Share via:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('facebook')}
                  className="justify-start"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('twitter')}
                  className="justify-start"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('whatsapp')}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('email')}
                  className="justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial('linkedin')}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadItinerary}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="bg-secondary/30 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{shareText}</pre>
            </div>
            
            {budgetBreakdown && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="font-semibold mb-2">Budget Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Accommodation</p>
                    <p className="font-semibold">₹{budgetBreakdown.accommodation.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Food</p>
                    <p className="font-semibold">₹{budgetBreakdown.food.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transport</p>
                    <p className="font-semibold">₹{budgetBreakdown.transport.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Activities</p>
                    <p className="font-semibold">₹{budgetBreakdown.activities.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
