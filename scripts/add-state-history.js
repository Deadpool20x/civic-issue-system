import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Import models
import Issue from '../models/Issue.js';
import StateHistory from '../models/StateHistory.js';

async function addStateHistory() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected');

        // Find all issues
        const issues = await Issue.find()
            .select('_id reportId status reportedBy createdAt updatedAt')
            .lean();

        console.log(`Found ${issues.length} issues`);

        let added = 0;

        for (const issue of issues) {
            // Check if state history already exists
            const existingHistory = await StateHistory.findOne({
                issueId: issue._id,
                status: 'submitted'
            });

            if (!existingHistory) {
                // Create initial state history
                await StateHistory.create({
                    issueId: issue._id,
                    status: 'submitted',
                    changedBy: issue.reportedBy,
                    comment: 'Issue reported by citizen',
                    timestamp: issue.createdAt
                });

                console.log(`✓ Added state history for ${issue.reportId}`);
                added++;
            }

            // If current status is not 'submitted', add another entry
            // Map Issue status to StateHistory status (pending -> submitted)
            let stateHistoryStatus = issue.status;
            if (issue.status === 'pending') {
                stateHistoryStatus = 'submitted';
            }
            
            if (stateHistoryStatus !== 'submitted') {
                const statusHistory = await StateHistory.findOne({
                    issueId: issue._id,
                    status: stateHistoryStatus
                });

                if (!statusHistory) {
                    await StateHistory.create({
                        issueId: issue._id,
                        status: stateHistoryStatus,
                        changedBy: issue.reportedBy,
                        comment: `Status changed to ${stateHistoryStatus}`,
                        timestamp: issue.updatedAt || issue.createdAt
                    });

                    console.log(`✓ Added ${stateHistoryStatus} history for ${issue.reportId}`);
                    added++;
                }
            }
        }

        console.log(`\n✅ Successfully added ${added} state history entries`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

addStateHistory();
