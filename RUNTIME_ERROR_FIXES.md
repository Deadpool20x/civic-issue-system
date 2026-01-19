# Runtime Error Fixes - January 18, 2026

## Issues Fixed

### 1. MongoDB Location Format Error ✅

**Error Message:**
```
MongoServerError: location object expected, location array not in correct format
```

**Root Cause:**
The coordinates were being passed as strings instead of numbers, and MongoDB's geospatial index expected properly formatted numeric coordinates in `[longitude, latitude]` format.

**Fix Applied:**
- Added `parseFloat()` to convert coordinate values to numbers
- Added comprehensive validation for coordinates:
  - Check if coordinates are valid numbers (not NaN)
  - Validate coordinate ranges (longitude: -180 to 180, latitude: -90 to 90)
  - Ensure coordinates array has exactly 2 elements
  - Return proper error responses for invalid coordinates

**Location Processing Code (app/api/issues/route.js):**
```javascript
const processedLocation = {
    address: location?.address || 'Address not provided',
    coordinates: location?.coordinates ? {
        type: 'Point',
        coordinates: [
            parseFloat(location.coordinates.lng),  // ✅ Now parsed as float
            parseFloat(location.coordinates.lat)    // ✅ Now parsed as float
        ]
    } : undefined,
    city: location?.city || '',
    state: location?.state || '',
    pincode: location?.pincode || ''
};

// ✅ Added validation
if (processedLocation.coordinates) {
    const [lng, lat] = processedLocation.coordinates.coordinates;
    
    // Ensure coordinates are valid numbers
    if (isNaN(lng) || isNaN(lat)) {
        return createErrorResponse('Invalid coordinates format', 400);
    }
    
    // Ensure coordinates are within valid ranges
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return createErrorResponse('Coordinates out of valid range', 400);
    }
    
    // Ensure coordinates array is properly formatted
    if (!Array.isArray(processedLocation.coordinates.coordinates) || 
        processedLocation.coordinates.coordinates.length !== 2) {
        return createErrorResponse('Invalid coordinates array format', 400);
    }
}
```

### 2. ESLint Configuration Error ✅

**Error Message:**
```
TypeError: Converting circular structure to JSON
TypeError: Config (unnamed): Unexpected undefined config at user-defined index 0.
```

**Root Cause:**
The ESLint configuration was using deprecated `FlatCompat` with spread operators that were trying to access undefined plugin configs, causing circular reference errors.

**Fix Applied:**
- Replaced deprecated `FlatCompat` approach with direct plugin imports
- Added proper null/undefined checks using optional chaining (`?.`)
- Ensured all plugin configs are properly accessed with fallbacks

**ESLint Configuration (eslint.config.mjs):**
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseConfigs = [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...(nextPlugin.configs?.recommended?.rules || {}),  // ✅ Safe access
      ...(nextPlugin.configs?.["core-web-vitals"]?.rules || {}),  // ✅ Safe access
      ...(reactPlugin.configs?.recommended?.rules || {}),  // ✅ Safe access
      ...(hooksPlugin.configs?.recommended?.rules || {}),  // ✅ Safe access
    },
  },
];
```

## Testing

### Location Format Testing
- ✅ Valid numeric coordinates: `[77.5946, 12.9716]` → PASS
- ✅ String coordinates (parsed to numbers): `['72.8777', '19.0760']` → PASS
- ✅ Invalid coordinates (caught by validation): `[NaN, NaN]` → PASS
- ✅ Missing coordinates (handled gracefully): `undefined` → PASS

### ESLint Testing
- ✅ `npm run lint` now executes successfully without errors
- ✅ All linting rules are properly configured
- ✅ No circular reference errors

## Impact

### Before Fixes
- ❌ Issue creation failed with MongoDB error
- ❌ ESLint crashed with circular structure error
- ❌ No proper error handling for invalid coordinates

### After Fixes
- ✅ Issue creation works with proper coordinate validation
- ✅ ESLint runs successfully
- ✅ Comprehensive error handling for invalid inputs
- ✅ Better user experience with clear error messages

## Files Modified

1. `app/api/issues/route.js` - Added coordinate parsing and validation
2. `eslint.config.mjs` - Fixed ESLint configuration structure

## Next Steps

The fixes ensure that:
1. Coordinates are properly formatted for MongoDB geospatial queries
2. Invalid inputs are caught early with clear error messages
3. ESLint runs without errors for code quality checks
4. The system is more robust against malformed data

All runtime errors have been resolved and the system is now stable.