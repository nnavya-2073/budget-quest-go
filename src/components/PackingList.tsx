import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Shirt, HeartPulse, Zap, Camera, Download, Check } from "lucide-react";
import { toast } from "sonner";

interface PackingListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: {
    name: string;
    duration: string;
    weather?: { climate: string; avgTemp: string };
    category: string;
    activities?: Array<{ name: string }>;
  };
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  essential: boolean;
}

export const PackingList = ({ open, onOpenChange, destination }: PackingListProps) => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);

  useEffect(() => {
    if (destination) {
      generatePackingList();
    }
  }, [destination]);

  const generatePackingList = () => {
    const items: PackingItem[] = [];
    const climate = destination.weather?.climate?.toLowerCase() || '';
    const duration = destination.duration?.toLowerCase() || '';
    const category = destination.category?.toLowerCase() || '';

    // Essential documents
    items.push(
      { id: 'passport', name: 'Passport', category: 'Documents', essential: true },
      { id: 'visa', name: 'Visa (if required)', category: 'Documents', essential: true },
      { id: 'tickets', name: 'Flight/Train Tickets', category: 'Documents', essential: true },
      { id: 'insurance', name: 'Travel Insurance', category: 'Documents', essential: true },
      { id: 'hotel', name: 'Hotel Confirmations', category: 'Documents', essential: false },
      { id: 'id', name: 'Photo ID', category: 'Documents', essential: true }
    );

    // Clothing based on climate
    if (climate.includes('cold') || climate.includes('winter') || climate.includes('snow')) {
      items.push(
        { id: 'jacket', name: 'Winter Jacket', category: 'Clothing', essential: true },
        { id: 'sweater', name: 'Sweaters/Hoodies', category: 'Clothing', essential: true },
        { id: 'thermals', name: 'Thermal Underwear', category: 'Clothing', essential: true },
        { id: 'gloves', name: 'Gloves', category: 'Clothing', essential: false },
        { id: 'scarf', name: 'Scarf', category: 'Clothing', essential: false }
      );
    } else if (climate.includes('hot') || climate.includes('tropical') || climate.includes('beach')) {
      items.push(
        { id: 'shorts', name: 'Shorts', category: 'Clothing', essential: true },
        { id: 'tshirts', name: 'Light T-shirts', category: 'Clothing', essential: true },
        { id: 'swimwear', name: 'Swimwear', category: 'Clothing', essential: true },
        { id: 'sunhat', name: 'Sun Hat', category: 'Clothing', essential: true },
        { id: 'sandals', name: 'Sandals/Flip-flops', category: 'Clothing', essential: false }
      );
    } else {
      items.push(
        { id: 'jeans', name: 'Jeans/Pants', category: 'Clothing', essential: true },
        { id: 'shirts', name: 'Casual Shirts', category: 'Clothing', essential: true },
        { id: 'jacket-light', name: 'Light Jacket', category: 'Clothing', essential: true }
      );
    }

    // Common clothing
    items.push(
      { id: 'underwear', name: 'Underwear', category: 'Clothing', essential: true },
      { id: 'socks', name: 'Socks', category: 'Clothing', essential: true },
      { id: 'shoes', name: 'Comfortable Walking Shoes', category: 'Clothing', essential: true },
      { id: 'sleepwear', name: 'Sleepwear', category: 'Clothing', essential: true }
    );

    // Health & hygiene
    items.push(
      { id: 'toothbrush', name: 'Toothbrush & Toothpaste', category: 'Health & Hygiene', essential: true },
      { id: 'medications', name: 'Prescription Medications', category: 'Health & Hygiene', essential: true },
      { id: 'firstaid', name: 'First Aid Kit', category: 'Health & Hygiene', essential: true },
      { id: 'sunscreen', name: 'Sunscreen', category: 'Health & Hygiene', essential: true },
      { id: 'sanitizer', name: 'Hand Sanitizer', category: 'Health & Hygiene', essential: true },
      { id: 'toiletries', name: 'Toiletries', category: 'Health & Hygiene', essential: true }
    );

    // Electronics
    items.push(
      { id: 'phone', name: 'Phone & Charger', category: 'Electronics', essential: true },
      { id: 'adapter', name: 'Universal Power Adapter', category: 'Electronics', essential: true },
      { id: 'powerbank', name: 'Power Bank', category: 'Electronics', essential: false },
      { id: 'camera', name: 'Camera', category: 'Electronics', essential: false },
      { id: 'headphones', name: 'Headphones', category: 'Electronics', essential: false }
    );

    // Activity-specific items
    if (category.includes('adventure') || category.includes('nature')) {
      items.push(
        { id: 'backpack', name: 'Hiking Backpack', category: 'Activity Gear', essential: true },
        { id: 'waterbottle', name: 'Reusable Water Bottle', category: 'Activity Gear', essential: true },
        { id: 'flashlight', name: 'Flashlight/Headlamp', category: 'Activity Gear', essential: false }
      );
    }

    if (category.includes('beach') || climate.includes('tropical')) {
      items.push(
        { id: 'snorkel', name: 'Snorkeling Gear', category: 'Activity Gear', essential: false },
        { id: 'beachtowel', name: 'Beach Towel', category: 'Activity Gear', essential: true },
        { id: 'sunglasses', name: 'Sunglasses', category: 'Activity Gear', essential: true }
      );
    }

    // Miscellaneous
    items.push(
      { id: 'money', name: 'Cash & Credit Cards', category: 'Miscellaneous', essential: true },
      { id: 'guidebook', name: 'Travel Guidebook/Maps', category: 'Miscellaneous', essential: false },
      { id: 'notebook', name: 'Notebook & Pen', category: 'Miscellaneous', essential: false },
      { id: 'bags', name: 'Reusable Shopping Bags', category: 'Miscellaneous', essential: false }
    );

    setPackingItems(items);
  };

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev =>
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const categories = Array.from(new Set(packingItems.map(item => item.category)));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documents': return <Briefcase className="w-5 h-5" />;
      case 'Clothing': return <Shirt className="w-5 h-5" />;
      case 'Health & Hygiene': return <HeartPulse className="w-5 h-5" />;
      case 'Electronics': return <Zap className="w-5 h-5" />;
      case 'Activity Gear': return <Camera className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const handleDownloadList = () => {
    const listText = categories.map(category => {
      const categoryItems = packingItems.filter(item => item.category === category);
      return `${category}:\n${categoryItems.map(item => `- ${item.name}`).join('\n')}`;
    }).join('\n\n');

    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${destination.name}-packing-list.txt`;
    a.click();
    toast.success("Packing list downloaded");
  };

  const progress = Math.round((checkedItems.length / packingItems.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Packing List for {destination.name}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">
              {destination.duration} • {destination.weather?.climate || 'Varied climate'}
            </div>
            <Button onClick={handleDownloadList} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Packing Progress</span>
            <span className="text-sm text-muted-foreground">{checkedItems.length}/{packingItems.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = packingItems.filter(item => item.category === category);
            const essentialCount = categoryItems.filter(item => item.essential).length;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                    </div>
                    {essentialCount > 0 && (
                      <Badge variant="secondary">{essentialCount} Essential</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryItems.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={checkedItems.includes(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className={`flex-1 cursor-pointer text-sm ${
                            checkedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.name}
                          {item.essential && (
                            <Badge variant="outline" className="ml-2 text-xs">Essential</Badge>
                          )}
                        </label>
                        {checkedItems.includes(item.id) && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {progress === 100 && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
            <p className="font-semibold text-primary">
              🎉 All packed! You're ready for your trip to {destination.name}!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
