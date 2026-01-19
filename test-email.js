// Load environment variables FIRST
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: resolve(__dirname, '.env.local') });

console.log('✓ Environment loaded');
console.log('✓ RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

// Now import email functions
import { sendReportConfirmation } from './lib/mailer.js';

async function testEmail() {
    console.log('\n📧 Sending test email...\n');

    const result = await sendReportConfirmation(
        'yashpatelkiran4@gmail.com', // ← CHANGE THIS TO YOUR REAL EMAIL
        {
            reportId: 'R00001',
            title: 'Pothole on Main Street',
            category: 'Roads & Infrastructure',
            location: '123 Main St, Ward 5',
            status: 'submitted'
        }
    );

    console.log('\n📬 Result:', result);

    if (result.success) {
        console.log('\n✅ SUCCESS! Check your email inbox.');
    } else {
        console.log('\n❌ ERROR:', result.error);
    }
}

testEmail();
