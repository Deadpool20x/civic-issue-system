'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DraggableMarker({ position, setPosition, onLocationChange }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const newPos = e.target.getLatLng();
          setPosition(newPos);
          onLocationChange(newPos);
        },
      }}
    />
  ) : null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  // Default center: Surendranagar, Gujarat, India
  const defaultCenter = { lat: 22.7281, lng: 71.6378 };

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // Reverse geocoding using OpenStreetMap Nominatim API
  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CivicIssueSystem/1.0',
          },
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        const formattedAddress = data.display_name;
        setAddress(formattedAddress);
        onLocationSelect({
          address: formattedAddress,
          coordinates: { lat, lng },
          city: data.address?.city || data.address?.town || '',
          state: data.address?.state || '',
          pincode: data.address?.postcode || '',
        });
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setError('Failed to get address. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Auto-detect GPS location
  const detectLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        await reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to detect location. Please select on map or enter manually.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleLocationChange = async (latlng) => {
    await reverseGeocode(latlng.lat, latlng.lng);
  };

  return (
    <div className="space-y-4">
      {/* Auto-detect button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={detectLocation}
          disabled={loading}
          className="flex-1 bg-brand-primary text-white px-4 py-3 rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Detecting Location...
            </>
          ) : (
            <>
              <span className="mr-2">📍</span>
              Auto-Detect My Location
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-status-warning/10 border border-status-warning/30 text-status-warning px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Map */}
      {mapLoaded && (
        <div className="border-2 border-slate-300 rounded-xl overflow-hidden" style={{ height: '400px' }}>
          <MapContainer
            center={position || initialLocation || defaultCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker
              position={position}
              setPosition={setPosition}
              onLocationChange={handleLocationChange}
            />
          </MapContainer>
        </div>
      )}

      {/* Hint text */}
      <p className="text-sm text-contrast-secondary">
        💡 <strong>Tip:</strong> Click "Auto-Detect" to use your GPS, click on the map, or drag the pin to set location.
      </p>

      {/* Address display */}
      {address && (
        <div className="bg-brand-soft/30 border border-brand-primary/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-contrast-primary mb-1">Detected Address:</p>
          <p className="text-sm text-contrast-secondary">{address}</p>
        </div>
      )}
    </div>
  );
}
