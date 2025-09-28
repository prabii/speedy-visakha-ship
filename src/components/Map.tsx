import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Map = () => {
  const [apiKey, setApiKey] = useState('');
  const [showInput, setShowInput] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  const initializeMap = async () => {
    if (!apiKey || !mapContainer.current) return;

    try {
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      mapboxgl.default.accessToken = apiKey;
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [83.2185, 17.6868], // Visakhapatnam coordinates
        zoom: 15,
      });

      // Add marker for the office location
      new mapboxgl.default.Marker({
        color: '#3b82f6'
      })
      .setLngLat([83.2185, 17.6868])
      .setPopup(
        new mapboxgl.default.Popup({ offset: 25 })
        .setHTML('<div><strong>Visakha International Couriers</strong><br/>7-17-7/2, Opp. Redcherry Bakery<br/>Old Gajuwaka, Visakhapatnam - 530026</div>')
      )
      .addTo(map.current);

      map.current.addControl(new mapboxgl.default.NavigationControl());
      setShowInput(false);
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (showInput) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Enter your Mapbox public token to view the interactive map
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="password"
            placeholder="Enter Mapbox public token"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button onClick={initializeMap}>Load Map</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Get your token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-elegant">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;