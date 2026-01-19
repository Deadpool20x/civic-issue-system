import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import the Issue model
import Issue from '../models/Issue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function addReportIds() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected');
    
    // Find all issues without reportId
    const issues = await Issue.find({ reportId: { $exists: false } })
      .sort({ createdAt: 1 })
      .select('_id createdAt');
    
    console.log(`Found ${issues.length} issues without reportId`);
    
    if (issues.length === 0) {
      console.log('✓ All issues already have reportIds');
      process.exit(0);
    }

    // Assign sequential reportIds
    for (let i = 0; i < issues.length; i++) {
      const reportId = `R${String(i + 1).padStart(5, '0')}`;
      await Issue.updateOne(
        { _id: issues[i]._id },
        { $set: { reportId } }
      );
      console.log(`✓ Assigned ${reportId} to issue ${issues[i]._id}`);
    }

    console.log(`\n✅ Successfully added reportIds to ${issues.length} issues`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

addReportIds();
