// lib/zones.js
// Simple boundary check for Anand District, Gujarat
// Adjust lat boundary based on actual district geography

const ANAND_NORTH_SOUTH_BOUNDARY = 22.55;
// Latitudes above this → North Zone
// Latitudes below this → South Zone

export function getZoneFromCoordinates(lat, lng) {
    if (!lat) return 'north'; // Fallback
    if (lat >= ANAND_NORTH_SOUTH_BOUNDARY) {
        return 'north';
    }
    return 'south';
}
