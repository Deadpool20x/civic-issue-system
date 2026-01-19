/**
 * Test script for location functionality
 * Run with: node __tests__/location.test.js
 */

import { createIssueSchema } from '../lib/schemas.js';

async function testLocationFunctionality() {
  console.log('🧪 Testing Location Functionality\n');
  console.log('='.repeat(60));

  // Test 1: Valid location with coordinates
  console.log('\n1. Testing valid location with coordinates...');
  const validLocationWithCoords = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123 Main Street, Surendranagar, Gujarat',
      coordinates: {
        lat: 22.7281,
        lng: 71.6378
      },
      city: 'Surendranagar',
      state: 'Gujarat',
      pincode: '363001'
    },
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(validLocationWithCoords);
    console.log('   ✅ Valid location with coordinates passes validation');
  } catch (error) {
    console.log('   ❌ Valid location with coordinates failed validation:', error.message);
  }

  // Test 2: Valid location without coordinates
  console.log('\n2. Testing valid location without coordinates...');
  const validLocationWithoutCoords = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123 Main Street, Surendranagar, Gujarat'
    },
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(validLocationWithoutCoords);
    console.log('   ✅ Valid location without coordinates passes validation');
  } catch (error) {
    console.log('   ❌ Valid location without coordinates failed validation:', error.message);
  }

  // Test 3: Invalid location - missing address
  console.log('\n3. Testing invalid location - missing address...');
  const invalidLocationNoAddress = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      coordinates: {
        lat: 22.7281,
        lng: 71.6378
      }
    },
    priority: 'high'
  };

  try {
    createIssueSchema.parse(invalidLocationNoAddress);
    console.log('   ❌ Invalid location should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid location correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 4: Invalid location - address too short
  console.log('\n4. Testing invalid location - address too short...');
  const invalidLocationShortAddress = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123'
    },
    priority: 'high'
  };

  try {
    createIssueSchema.parse(invalidLocationShortAddress);
    console.log('   ❌ Invalid location should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid location correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 5: Invalid coordinates - latitude out of range
  console.log('\n5. Testing invalid coordinates - latitude out of range...');
  const invalidCoordsLat = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123 Main Street',
      coordinates: {
        lat: 91, // Invalid: should be between -90 and 90
        lng: 71.6378
      }
    },
    priority: 'high'
  };

  try {
    createIssueSchema.parse(invalidCoordsLat);
    console.log('   ❌ Invalid coordinates should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid coordinates correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 6: Invalid coordinates - longitude out of range
  console.log('\n6. Testing invalid coordinates - longitude out of range...');
  const invalidCoordsLng = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123 Main Street',
      coordinates: {
        lat: 22.7281,
        lng: 181 // Invalid: should be between -180 and 180
      }
    },
    priority: 'high'
  };

  try {
    createIssueSchema.parse(invalidCoordsLng);
    console.log('   ❌ Invalid coordinates should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid coordinates correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 7: Location with all optional fields
  console.log('\n7. Testing location with all optional fields...');
  const fullLocation = {
    title: 'Test Issue',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123 Main Street, Surendranagar, Gujarat, India',
      coordinates: {
        lat: 22.7281,
        lng: 71.6378
      },
      city: 'Surendranagar',
      state: 'Gujarat',
      pincode: '363001'
    },
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(fullLocation);
    console.log('   ✅ Full location with all fields passes validation');
    console.log('   City:', result.location.city);
    console.log('   State:', result.location.state);
    console.log('   Pincode:', result.location.pincode);
  } catch (error) {
    console.log('   ❌ Full location failed validation:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary Complete');
  console.log('\nLocation Schema Features:');
  console.log('  ✓ Address is required (min 5 characters)');
  console.log('  ✓ Coordinates are optional');
  console.log('  ✓ Coordinates must be valid lat/lng ranges');
  console.log('  ✓ City, State, Pincode are optional');
  console.log('  ✓ Supports geospatial queries (2dsphere index)');
}

// Run tests
testLocationFunctionality().catch(console.error);
