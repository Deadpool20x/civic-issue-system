'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslation } from '@/lib/useStaticTranslation'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

export default function NearbyIssuesMap({ center }) {
    const { t } = useTranslation()
    const [issues, setIssues] = useState([])
    const [L, setL] = useState(null)

    useEffect(() => {
        import('leaflet').then(leaflet => {
            setL(leaflet.default)
        })

        const fetchNearby = () => {
            if (center) {
                fetch(`/api/issues/nearby?lat=${center[0]}&lng=${center[1]}&radius=5`)
                    .then(res => res.json())
                    .then(data => setIssues(data.issues || []))
                    .catch(err => console.error('Map fetch error:', err))
            }
        };

        fetchNearby();
        const interval = setInterval(fetchNearby, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [center])

    if (!center || !L) return <div className="h-64 bg-white/5 animate-pulse rounded-3xl border border-border" />

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: var(--gold); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(255,215,0,0.5);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    })

    return (
        <div className="card overflow-hidden !p-0 h-64 shadow-2xl relative group">
            <div className="absolute top-4 left-4 z-[400] bg-page-bg/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gold/30 flex items-center gap-2">
                <span className="text-xs font-black text-gold uppercase tracking-widest">{t('citizen.nearbyIssues')}</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={center} icon={L.divIcon({
                    className: 'user-icon',
                    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59,130,246,0.6);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })}>
                    <Popup>{t('report.location')}</Popup>
                </Marker>
                {issues.map(issue => (
                    <Marker
                        key={issue._id}
                        position={[issue.location.coordinates.coordinates[1], issue.location.coordinates.coordinates[0]]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-xs mb-1">{issue.title}</p>
                                <p className="text-[10px] uppercase text-gold">{issue.status}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
