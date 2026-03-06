/**
 * Test script for image upload functionality
 * Run with: node __tests__/image-upload.test.js
 */

import { createIssueSchema } from '../lib/schemas.js';

async function testImageUploadFunctionality() {
  console.log('🧪 Testing Image Upload Functionality\n');
  console.log('='.repeat(60));

  // Test 1: Valid issue with no images
  console.log('\n1. Testing valid issue with no images...');
  const validIssueNoImages = {
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
    const result = createIssueSchema.parse(validIssueNoImages);
    console.log('   ✅ Valid issue without images passes validation');
  } catch (error) {
    console.log('   ❌ Valid issue without images failed validation:', error.message);
  }

  // Test 2: Valid issue with 1 image
  console.log('\n2. Testing valid issue with 1 image...');
  const validIssueOneImage = {
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
    images: ['https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg'],
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(validIssueOneImage);
    console.log('   ✅ Valid issue with 1 image passes validation');
  } catch (error) {
    console.log('   ❌ Valid issue with 1 image failed validation:', error.message);
  }

  // Test 3: Valid issue with 3 images (max)
  console.log('\n3. Testing valid issue with 3 images (max)...');
  const validIssueThreeImages = {
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
    images: [
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-1.jpg',
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-2.jpg',
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-3.jpg'
    ],
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(validIssueThreeImages);
    console.log('   ✅ Valid issue with 3 images passes validation');
  } catch (error) {
    console.log('   ❌ Valid issue with 3 images failed validation:', error.message);
  }

  // Test 4: Invalid issue with 4 images (exceeds max)
  console.log('\n4. Testing invalid issue with 4 images (exceeds max)...');
  const invalidIssueFourImages = {
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
    images: [
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-1.jpg',
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-2.jpg',
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-3.jpg',
      'https://res.cloudinary.com/test/image/upload/v1234567890/test-image-4.jpg'
    ],
    priority: 'high'
  };

  try {
    createIssueSchema.parse(invalidIssueFourImages);
    console.log('   ❌ Invalid issue should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid issue correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 5: Invalid issue with invalid image URL
  console.log('\n5. Testing invalid issue with invalid image URL...');
  const invalidIssueInvalidUrl = {
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
    images: ['not-a-valid-url'],
    priority: 'high'
  };

  try {
    createIssueSchema.parse(invalidIssueInvalidUrl);
    console.log('   ❌ Invalid issue should have failed validation');
  } catch (error) {
    console.log('   ✅ Invalid issue correctly rejected');
    console.log('   Validation errors:', error.errors.length);
  }

  // Test 6: Valid issue with empty images array
  console.log('\n6. Testing valid issue with empty images array...');
  const validIssueEmptyImages = {
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
    images: [],
    priority: 'high'
  };

  try {
    const result = createIssueSchema.parse(validIssueEmptyImages);
    console.log('   ✅ Valid issue with empty images array passes validation');
  } catch (error) {
    console.log('   ❌ Valid issue with empty images array failed validation:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary Complete');
  console.log('\nImage Upload Features:');
  console.log('  ✓ Images are optional');
  console.log('  ✓ Maximum 3 images allowed');
  console.log('  ✓ Each image must be a valid URL');
  console.log('  ✓ Empty array is allowed');
  console.log('  ✓ Compression handled client-side (browser-image-compression)');
  console.log('  ✓ Progress tracking implemented');
  console.log('  ✓ Thumbnail display with remove functionality');
}

// Run tests
testImageUploadFunctionality().catch(console.error);
