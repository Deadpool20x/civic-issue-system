// lib/zones.js
// Determines zone from GPS coordinates for Anand District, Gujarat
// North Zone = Ward 1-8, South Zone = Ward 9-16

const ANAND_NORTH_SOUTH_BOUNDARY = 22.55
// Latitudes above this value = North Zone
// Latitudes below this value = South Zone

export function getZoneFromCoordinates(lat, lng) {
  if (lat === null || lat === undefined) return 'north'
  const numLat = parseFloat(lat)
  if (isNaN(numLat)) return 'north'
  return numLat >= ANAND_NORTH_SOUTH_BOUNDARY ? 'north' : 'south'
}