/**
 * Test script for category structure
 * Run with: node __tests__/category.test.js
 */

import { CATEGORIES, createIssueSchema } from '../lib/schemas.js';

async function testCategoryStructure() {
  console.log('🧪 Testing PRD Category Structure\n');
  console.log('='.repeat(60));

  // Test 1: Verify CATEGORIES object structure
  console.log('\n1. Testing CATEGORIES object structure...');
  const expectedCategories = [
    'roads-infrastructure',
    'street-lighting',
    'waste-management',
    'water-drainage',
    'parks-public-spaces',
    'traffic-signage',
    'public-health-safety',
    'other'
  ];

  const actualCategories = Object.keys(CATEGORIES);
  const hasAllCategories = expectedCategories.every(cat => actualCategories.includes(cat));
  
  if (hasAllCategories && actualCategories.length === expectedCategories.length) {
    console.log('   ✅ All 8 categories present');
    console.log('   Categories:', actualCategories.join(', '));
  } else {
    console.log('   ❌ Missing or extra categories');
    console.log('   Expected:', expectedCategories.join(', '));
    console.log('   Actual:', actualCategories.join(', '));
  }

  // Test 2: Verify each category has label and subcategories
  console.log('\n2. Testing category structure...');
  let structureValid = true;
  
  for (const [key, value] of Object.entries(CATEGORIES)) {
    if (!value.label || !value.subcategories || !Array.isArray(value.subcategories)) {
      console.log(`   ❌ Invalid structure for ${key}`);
      structureValid = false;
    } else {
      console.log(`   ✅ ${key}: ${value.label} (${value.subcategories.length} subcategories)`);
    }
  }

  // Test 3: Verify subcategories are not empty
  console.log('\n3. Testing subcategories...');
  let subcategoriesValid = true;
  
  for (const [key, value] of Object.entries(CATEGORIES)) {
    if (value.subcategories.length === 0) {
      console.log(`   ❌ ${key} has no subcategories`);
      subcategoriesValid = false;
    }
  }
  
  if (subcategoriesValid) {
    console.log('   ✅ All categories have subcategories');
  }

  // Test 4: Test schema validation with valid data
  console.log('\n4. Testing schema validation...');
  const validData = {
    title: 'Test Issue Title',
    description: 'This is a detailed description of the issue that meets the minimum length requirement',
    category: 'roads-infrastructure',
    subcategory: 'Pothole',
    location: {
      address: '123 Main Street',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(validData);
    console.log('   ✅ Valid data passes schema validation');
  } catch (error) {
    console.log('   ❌ Valid data failed schema validation:', error.message);
  }

  // Test 5: Test schema validation with invalid data
  console.log('\n5. Testing schema validation with invalid data...');
  const invalidData = {
    title: 'Test',
    description: 'Too short',
    category: 'invalid-category',
    subcategory: '',
    location: {
      address: '123 Main Street',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    }
  };

  try {
    createIssueSchema.parse(invalidData);
    console.log('   ❌ Invalid data should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid data correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 6: Verify emoji labels
  console.log('\n6. Testing emoji labels...');
  const expectedEmojis = {
    'roads-infrastructure': '🚧',
    'street-lighting': '💡',
    'waste-management': '🗑️',
    'water-drainage': '🚰',
    'parks-public-spaces': '🌳',
    'traffic-signage': '🚦',
    'public-health-safety': '🐕',
    'other': '📋'
  };

  let emojisValid = true;
  for (const [key, expectedEmoji] of Object.entries(expectedEmojis)) {
    const actualLabel = CATEGORIES[key]?.label;
    if (!actualLabel || !actualLabel.startsWith(expectedEmoji)) {
      console.log(`   ❌ ${key}: Missing or incorrect emoji`);
      emojisValid = false;
    }
  }
  
  if (emojisValid) {
    console.log('   ✅ All categories have correct emoji labels');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary Complete');
  console.log('\nCategory Structure:');
  for (const [key, value] of Object.entries(CATEGORIES)) {
    console.log(`  ${value.label}`);
    console.log(`    Subcategories: ${value.subcategories.join(', ')}`);
  }
}

// Run tests
testCategoryStructure().catch(console.error);
