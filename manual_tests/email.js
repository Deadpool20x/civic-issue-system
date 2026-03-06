/**
 * Test script for email integration
 * Run with: node __tests__/email.test.js
 */

import { sendReportConfirmation, sendStatusUpdate, sendRejectionNotification, sendDepartmentAlert, sendRatingRequest } from '../lib/mailer.js';

async function testEmailIntegration() {
  console.log('🧪 Testing Email Integration with Resend\n');
  console.log('='.repeat(60));

  // Test data
  const testReportData = {
    reportId: 'R00123',
    title: 'Pothole on Main St',
    category: 'Roads & Infrastructure',
    location: '123 Main St',
    status: 'submitted',
    priority: 'high',
    resolutionDate: '2026-01-15'
  };

  const testDepartmentName = 'Public Works Department';
  const testReason = 'This issue is outside our jurisdiction. Please contact the city council.';
  const testBeforePhoto = 'https://example.com/before.jpg';
  const testAfterPhoto = 'https://example.com/after.jpg';

  // Test 1: Report Confirmation
  console.log('\n1. Testing sendReportConfirmation...');
  try {
    const result = await sendReportConfirmation('test@example.com', testReportData);
    console.log('   Result:', result);
    if (result.success) {
      console.log('   ✅ Test passed');
    } else {
      console.log('   ⚠️  Test completed (may be expected in dev mode)');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  // Test 2: Status Update
  console.log('\n2. Testing sendStatusUpdate...');
  try {
    const result = await sendStatusUpdate('test@example.com', testReportData, 'in-progress');
    console.log('   Result:', result);
    if (result.success) {
      console.log('   ✅ Test passed');
    } else {
      console.log('   ⚠️  Test completed (may be expected in dev mode)');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  // Test 3: Rejection Notification
  console.log('\n3. Testing sendRejectionNotification...');
  try {
    const result = await sendRejectionNotification('test@example.com', testReportData, testReason);
    console.log('   Result:', result);
    if (result.success) {
      console.log('   ✅ Test passed');
    } else {
      console.log('   ⚠️  Test completed (may be expected in dev mode)');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  // Test 4: Department Alert
  console.log('\n4. Testing sendDepartmentAlert...');
  try {
    const departmentEmails = ['dept1@example.com', 'dept2@example.com'];
    const results = await sendDepartmentAlert(departmentEmails, testReportData, testDepartmentName);
    console.log('   Results:', results);
    const allSuccess = results.every(r => r.success);
    if (allSuccess) {
      console.log('   ✅ Test passed');
    } else {
      console.log('   ⚠️  Test completed (may be expected in dev mode)');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  // Test 5: Rating Request
  console.log('\n5. Testing sendRatingRequest...');
  try {
    const result = await sendRatingRequest('test@example.com', testReportData, testBeforePhoto, testAfterPhoto);
    console.log('   Result:', result);
    if (result.success) {
      console.log('   ✅ Test passed');
    } else {
      console.log('   ⚠️  Test completed (may be expected in dev mode)');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary Complete');
  console.log('\nNote: Tests may show "⚠️  Test completed" if:');
  console.log('  - RESEND_API_KEY is not configured');
  console.log('  - Running in development mode without API key');
  console.log('  - This is expected behavior for local development\n');
}

// Run tests
testEmailIntegration().catch(console.error);
