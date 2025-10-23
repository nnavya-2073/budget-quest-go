import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TravelMate
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost">How It Works</Button>
          <Button variant="hero">Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
