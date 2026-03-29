'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in Next.js
const setupLeaflet = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

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
        setupLeaflet();
        setMapLoaded(true);
    }, []);

    const reverseGeocode = async (lat, lng) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'User-Agent': 'CivicIssueSystem/1.0' } }
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
            setError('Failed to get address automatically.');
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = { lat: latitude, lng: longitude };
                setPosition(newPos);
                await reverseGeocode(latitude, longitude);
                setLoading(false);
            },
            (err) => {
                setError('Location access denied. Please click on map manually.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleLocationChange = async (latlng) => {
        await reverseGeocode(latlng.lat, latlng.lng);
    };

    return (
        <div className="space-y-4">
            <button
                type="button"
                onClick={detectLocation}
                disabled={loading}
                className="btn-outline w-full py-3 flex items-center justify-center gap-2 border-gold/30 text-gold hover:bg-gold/10"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                ) : <span>📍</span>}
                Detect My Location
            </button>

            {error && <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}

            <div className="rounded-card border border-border overflow-hidden h-[300px] relative z-0">
                {mapLoaded && MapContainer && (
                    <MapContainer
                        center={position || initialLocation || defaultCenter}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <DraggableMarker
                            position={position}
                            setPosition={setPosition}
                            onLocationChange={handleLocationChange}
                        />
                    </MapContainer>
                )}
            </div>

            {address && (
                <div className="p-3 bg-white/5 border border-border rounded-xl text-xs text-text-secondary italic">
                    <span className="text-gold not-italic mr-1">✓</span> {address}
                </div>
            )}
        </div>
    );
}
