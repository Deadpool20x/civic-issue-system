// lib/department-mapper.js
// Maps form category slug to ward department code
// Form sends:  'roads-infrastructure'
// Wards uses:  'roads'
// This file bridges the two.

const CATEGORY_TO_DEPT = {
  'roads-infrastructure':  'roads',
  'street-lighting':       'lighting',
  'waste-management':      'waste',
  'water-drainage':        'water',
  'parks-public-spaces':   'parks',
  'traffic-signage':       'traffic',
  'public-health-safety':  'health',
  'other':                 'other',
}

export function getDepartmentCodeForCategory(category) {
  return CATEGORY_TO_DEPT[category] || 'other'
}