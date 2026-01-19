'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import IssuePopup from './IssuePopup';

// Custom marker icons based on status and priority
const createCustomIcon = (status, priority) => {
    const baseSize = priority === 'urgent' ? 40 : 30;
    const shadowSize = baseSize + 10;

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

    return L.divIcon({
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
    const [map, setMap] = useState(null);

    // Center map on India
    const center = [22.7196, 75.8577];
    const zoom = 6;

    // Handle map ready
    const MapUpdater = () => {
        const map = useMap();
        useEffect(() => {
            if (map) {
                setMap(map);
            }
        }, [map]);
        return null;
    };

    return (
        <div className="w-full h-full">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <MapUpdater />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {issues.map((issue) => {
                        if (!issue.location?.coordinates ||
                            !Array.isArray(issue.location.coordinates) ||
                            issue.location.coordinates.length < 2) {
                            return null;
                        }

                        // MongoDB stores coordinates as [lng, lat], Leaflet expects [lat, lng]
                        const lat = issue.location.coordinates[1];
                        const lng = issue.location.coordinates[0];

                        if (typeof lat !== 'number' || typeof lng !== 'number') {
                            return null;
                        }

                        return (
                            <Marker
                                key={issue.reportId}
                                position={[lat, lng]}
                                icon={createCustomIcon(issue.status, issue.priority)}
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
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default IssueMap;
