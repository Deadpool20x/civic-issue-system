import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { getTokenData } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    await connectDB();

    const userData = await getTokenData(req);

    if (!userData) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and municipal can access all issues
    if (!['admin', 'municipal'].includes(userData.role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all issues
    const issues = await Issue.find()
      .select('reportId title description category subcategory status priority location upvotes upvotedBy createdAt updatedAt images reportedBy assignedDepartment')
      .populate('reportedBy', 'name email')
      .populate('assignedDepartment', 'name')
      .populate('upvotedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Return in consistent format
    return Response.json({
      success: true,
      issues: issues,
      count: issues.length
    });

  } catch (error) {
    console.error('❌ Error fetching admin issues:', error);
    return Response.json({
      error: 'Failed to fetch issues',
      details: error.message
    }, { status: 500 });
  }
}
