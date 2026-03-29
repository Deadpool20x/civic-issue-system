// lib/wards.js
// SINGLE SOURCE OF TRUTH — never hardcode ward data anywhere else

export const DEPARTMENTS = {
    roads: { id: 'roads', name: 'Roads & Infrastructure', icon: '🛣️' },
    lighting: { id: 'lighting', name: 'Street Lighting', icon: '💡' },
    waste: { id: 'waste', name: 'Waste Management', icon: '🗑️' },
    water: { id: 'water', name: 'Water & Drainage', icon: '💧' },
    parks: { id: 'parks', name: 'Parks & Public Spaces', icon: '🌳' },
    traffic: { id: 'traffic', name: 'Traffic & Signage', icon: '🚦' },
    health: { id: 'health', name: 'Public Health & Safety', icon: '🏥' },
    other: { id: 'other', name: 'Other / General', icon: '📋' },
}

export const ZONES = {
    north: { id: 'north', name: 'North Zone', color: 'blue' },
    south: { id: 'south', name: 'South Zone', color: 'purple' },
}

// THE MASTER WARD MAP
// wardId → zone + department
export const WARD_MAP = {
    'ward-1': { wardId: 'ward-1', wardNumber: 1, zone: 'north', departmentId: 'roads' },
    'ward-2': { wardId: 'ward-2', wardNumber: 2, zone: 'north', departmentId: 'lighting' },
    'ward-3': { wardId: 'ward-3', wardNumber: 3, zone: 'north', departmentId: 'waste' },
    'ward-4': { wardId: 'ward-4', wardNumber: 4, zone: 'north', departmentId: 'water' },
    'ward-5': { wardId: 'ward-5', wardNumber: 5, zone: 'north', departmentId: 'parks' },
    'ward-6': { wardId: 'ward-6', wardNumber: 6, zone: 'north', departmentId: 'traffic' },
    'ward-7': { wardId: 'ward-7', wardNumber: 7, zone: 'north', departmentId: 'health' },
    'ward-8': { wardId: 'ward-8', wardNumber: 8, zone: 'north', departmentId: 'other' },
    'ward-9': { wardId: 'ward-9', wardNumber: 9, zone: 'south', departmentId: 'roads' },
    'ward-10': { wardId: 'ward-10', wardNumber: 10, zone: 'south', departmentId: 'lighting' },
    'ward-11': { wardId: 'ward-11', wardNumber: 11, zone: 'south', departmentId: 'waste' },
    'ward-12': { wardId: 'ward-12', wardNumber: 12, zone: 'south', departmentId: 'water' },
    'ward-13': { wardId: 'ward-13', wardNumber: 13, zone: 'south', departmentId: 'parks' },
    'ward-14': { wardId: 'ward-14', wardNumber: 14, zone: 'south', departmentId: 'traffic' },
    'ward-15': { wardId: 'ward-15', wardNumber: 15, zone: 'south', departmentId: 'health' },
    'ward-16': { wardId: 'ward-16', wardNumber: 16, zone: 'south', departmentId: 'other' },
}

// HELPER: Get ward display name
// Returns: "Ward 1 — North Zone · Roads & Infrastructure"
export function getWardLabel(wardId) {
    const ward = WARD_MAP[wardId]
    if (!ward) return wardId
    const zone = ZONES[ward.zone]
    const dept = DEPARTMENTS[ward.departmentId]
    return `Ward ${ward.wardNumber} — ${zone.name} · ${dept.name}`
}

// HELPER: Get both wards for a department manager
// Roads manager → ['ward-1', 'ward-9']
export function getDepartmentWards(departmentId) {
    return Object.values(WARD_MAP)
        .filter(w => w.departmentId === departmentId)
        .map(w => w.wardId)
}

// HELPER: Get all wards in a zone
// North → ['ward-1','ward-2',...,'ward-8']
export function getZoneWards(zone) {
    return Object.values(WARD_MAP)
        .filter(w => w.zone === zone)
        .map(w => w.wardId)
}

// HELPER: Get zone from wardId
export function getWardZone(wardId) {
    return WARD_MAP[wardId]?.zone || null
}

// HELPER: Get department from wardId
export function getWardDepartment(wardId) {
    return WARD_MAP[wardId]?.departmentId || null
}

// HELPER: Get ward by zone + department
export function getWardByZoneDept(zone, departmentId) {
    return Object.values(WARD_MAP)
        .find(w => w.zone === zone && w.departmentId === departmentId) || null
}
