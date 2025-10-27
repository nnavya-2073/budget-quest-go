import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Destination {
  name: string;
  coordinates?: { lat: number; lng: number };
  cost: number;
  category: string;
}

interface MapViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinations: Destination[];
  departureCity?: string;
}

const MapView = ({ open, onOpenChange, destinations, departureCity }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!open || !mapContainer.current) return;

    // Initialize map with a placeholder token message
    const initMap = () => {
      if (map.current) return;

      // For now, show a message about Mapbox token
      // In production, user would need to add their Mapbox token
      mapContainer.current!.innerHTML = `
        <div style="display: flex; flex-col; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center;">
          <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Map View Available</h3>
          <p style="color: #666; margin-bottom: 1rem;">To enable interactive map view with destination markers, you'll need a Mapbox access token.</p>
          <p style="color: #666; margin-bottom: 1rem;">Get your free token at <a href="https://mapbox.com" target="_blank" style="color: #0066cc;">mapbox.com</a></p>
          <div style="margin-top: 2rem; text-align: left; width: 100%; max-width: 500px;">
            <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Destinations on your map:</h4>
            <ul style="list-style: disc; padding-left: 1.5rem;">
              ${destinations.filter(d => d.coordinates).map(d => `
                <li style="margin-bottom: 0.5rem;">
                  ${d.name} - ${d.category} (₹${d.cost.toLocaleString('en-IN')})
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, destinations]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Destination Map View</DialogTitle>
        </DialogHeader>
        <div ref={mapContainer} className="w-full h-full rounded-lg bg-muted" />
      </DialogContent>
    </Dialog>
  );
};

export default MapView;