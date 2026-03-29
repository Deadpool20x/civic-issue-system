'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import IssuePopup from './IssuePopup';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Custom marker icons based on status and priority
const createCustomIcon = (leaflet, status, priority) => {
    if (!leaflet) return null;

    const baseSize = priority === 'urgent' ? 40 : 30;

    const statusColors = {
        pending: '#FBBF24', // yellow
        assigned: '#3B82F6', // blue
        'in-progress': '#1D4ED8', // dark blue
        resolved: '#10B981', // green
        rejected: '#EF4444', // red
        reopened: '#FBBF24', // yellow
        escalated: '#EF4444' // red
    };

    const color = statusColors[status] || '#FBBF24';

    return leaflet.divIcon({
        html: `
            <div style="
                width: ${baseSize}px;
                height: ${baseSize}px;
                border-radius: 50%;
                background-color: ${color};
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: ${baseSize === 40 ? '14px' : '12px'};
            ">
                ${priority === 'urgent' ? '!' : ''}
            </div>
        `,
        className: '',
        iconSize: [baseSize, baseSize],
        iconAnchor: [baseSize / 2, baseSize / 2]
    });
};

const IssueMap = ({ issues = [], onMarkerClick }) => {
    const [leaflet, setLeaflet] = useState(null);

    useEffect(() => {
        let mounted = true;
        import('leaflet').then((mod) => {
            if (mounted) setLeaflet(mod.default);
        });
        return () => { mounted = false; };
    }, []);

    // Center map on India
    const center = [22.7196, 75.8577];
    const zoom = 6;

    if (!leaflet) {
        return (
            <div className="w-full h-64 bg-[#1A1A1A] rounded-[20px] border border-[#333333] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-[#AAAAAA] text-sm">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <>
                    {issues.map((issue) => {
                        // Handle both nested and flat coordinate structures
                        const coordinates = issue.location?.coordinates?.coordinates || issue.location?.coordinates;

                        if (!coordinates ||
                            !Array.isArray(coordinates) ||
                            coordinates.length < 2) {
                            return null;
                        }

                        // MongoDB stores coordinates as [lng, lat], Leaflet expects [lat, lng]
                        const lat = coordinates[1];
                        const lng = coordinates[0];

                        if (typeof lat !== 'number' || typeof lng !== 'number' ||
                            isNaN(lat) || isNaN(lng)) {
                            return null;
                        }

                        return (
                            <Marker
                                key={issue.reportId || issue._id || Math.random()}
                                position={[lat, lng]}
                                icon={createCustomIcon(leaflet, issue.status, issue.priority)}
                                eventHandlers={{
                                    click: () => {
                                        if (onMarkerClick) {
                                            onMarkerClick(issue);
                                        }
                                    }
                                }}
                            >
                                <Popup>
                                    <IssuePopup issue={issue} />
                                </Popup>
                            </Marker>
                        );
                    })}
                </>
            </MapContainer>
        </div>
    );
};

export default IssueMap;
