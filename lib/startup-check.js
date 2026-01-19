/**
 * Startup Validation Script
 * Validates critical configurations before the application starts
 * This helps catch configuration errors early and provides helpful error messages
 */

import { connectDB } from './mongodb.js';

const REQUIRED_ENV_VARS = {
  critical: [
    'MONGODB_URI',
    'JWT_SECRET'
  ],
  recommended: [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ],
  optional: [
    'RESEND_API_KEY',
    'OPENAI_API_KEY'
  ]
};

/**
 * Check environment variables
 */
function checkEnvironmentVariables() {
  const issues = {
    critical: [],
    warnings: []
  };
  
  // Check critical variables
  REQUIRED_ENV_VARS.critical.forEach(varName => {
    if (!process.env[varName]) {
      issues.critical.push(`❌ ${varName} is REQUIRED but not set`);
    }
  });
  
  // Check recommended variables
  REQUIRED_ENV_VARS.recommended.forEach(varName => {
    if (!process.env[varName]) {
      issues.warnings.push(`⚠️  ${varName} is recommended but not set`);
    }
  });
  
  // Check optional variables
  const optionalMissing = REQUIRED_ENV_VARS.optional.filter(
    varName => !process.env[varName]
  );
  
  if (optionalMissing.length > 0) {
    issues.warnings.push(`ℹ️  Optional variables not set: ${optionalMissing.join(', ')}`);
  }
  
  return issues;
}

/**
 * Validate JWT_SECRET strength
 */
function validateJWTSecret() {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    return { valid: false, message: 'JWT_SECRET is not set' };
  }
  
  if (secret.length < 32) {
    return {
      valid: false,
      message: 'JWT_SECRET is too short (minimum 32 characters recommended)'
    };
  }
  
  // Check if it's a common weak secret
  const weakSecrets = ['secret', 'password', '123456', 'changeme', 'your-secret-here'];
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    return {
      valid: false,
      message: 'JWT_SECRET appears to be a weak/default value'
    };
  }
  
  return { valid: true };
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  if (!process.env.MONGODB_URI) {
    return {
      connected: false,
      message: 'MONGODB_URI not configured'
    };
  }
  
  try {
    await connectDB();
    return {
      connected: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      connected: false,
      message: error.message,
      suggestions: [
        'Ensure MongoDB is running (run `mongod` or check your service)',
        'Verify MONGODB_URI is correct in .env.local',
        'Check network connectivity if using remote database',
        'For Windows: Try running .\\start-local-db.bat'
      ]
    };
  }
}

/**
 * Validate Next.js configuration
 */
function validateNextConfig() {
  const issues = [];
  
  // Check if port is available (3001 is default for this app)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.includes('3001')) {
    issues.push('⚠️  App URL doesn\'t use port 3001 (default for this project)');
  }
  
  return issues;
}

/**
 * Check for common file issues
 */
function checkProjectStructure() {
  const fs = require('fs');
  const path = require('path');
  const issues = [];
  
  // Critical directories
  const requiredDirs = [
    'app',
    'components',
    'lib',
    'models',
    'public'
  ];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      issues.push(`❌ Required directory missing: ${dir}`);
    }
  });
  
  // Check for .env.local
  if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) {
    issues.push('⚠️  .env.local not found. Copy from .env.example');
  }
  
  return issues;
}

/**
 * Main startup validation function
 */
export async function runStartupCheck() {
  console.log('\n🔍 Running Civic Issue System Startup Check...\n');
  
  let hasErrors = false;
  
  // Check 1: Project Structure
  console.log('📁 Checking project structure...');
  const structureIssues = checkProjectStructure();
  if (structureIssues.length > 0) {
    structureIssues.forEach(issue => console.log(`   ${issue}`));
    if (structureIssues.some(i => i.includes('❌'))) hasErrors = true;
  } else {
    console.log('   ✅ Project structure OK\n');
  }
  
  // Check 2: Environment Variables
  console.log('🔐 Checking environment variables...');
  const envIssues = checkEnvironmentVariables();
  
  if (envIssues.critical.length > 0) {
    console.log('   CRITICAL ISSUES:');
    envIssues.critical.forEach(issue => console.log(`   ${issue}`));
    hasErrors = true;
  }
  
  if (envIssues.warnings.length > 0) {
    console.log('   WARNINGS:');
    envIssues.warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (envIssues.critical.length === 0 && envIssues.warnings.length === 0) {
    console.log('   ✅ All environment variables configured\n');
  } else {
    console.log();
  }
  
  // Check 3: JWT Secret Strength
  console.log('🔑 Validating JWT secret...');
  const jwtValidation = validateJWTSecret();
  if (!jwtValidation.valid) {
    console.log(`   ❌ ${jwtValidation.message}`);
    hasErrors = true;
  } else {
    console.log('   ✅ JWT secret is strong\n');
  }
  
  // Check 4: Database Connection
  console.log('💾 Testing database connection...');
  const dbResult = await testDatabaseConnection();
  if (dbResult.connected) {
    console.log(`   ✅ ${dbResult.message}\n`);
  } else {
    console.log(`   ❌ ${dbResult.message}`);
    if (dbResult.suggestions) {
      console.log('   Suggestions:');
      dbResult.suggestions.forEach(s => console.log(`   - ${s}`));
    }
    hasErrors = true;
    console.log();
  }
  
  // Check 5: Next.js Configuration
  console.log('⚙️  Validating Next.js configuration...');
  const nextIssues = validateNextConfig();
  if (nextIssues.length > 0) {
    nextIssues.forEach(issue => console.log(`   ${issue}`));
  } else {
    console.log('   ✅ Next.js configuration OK\n');
  }
  
  // Summary
  if (hasErrors) {
    console.log('❌ STARTUP CHECK FAILED');
    console.log('   Please fix the critical issues above before starting the application.\n');
    console.log('📚 Help:');
    console.log('   - Check README.md for setup instructions');
    console.log('   - Copy .env.example to .env.local and fill in your values');
    console.log('   - Ensure MongoDB is running\n');
    return false;
  } else {
    console.log('✅ STARTUP CHECK PASSED');
    console.log('   Your application is ready to start!\n');
    return true;
  }
}

/**
 * Run check if called directly
 */
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runStartupCheck().then(success => {
    process.exit(success ? 0 : 1);
  });
}
