import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { getTokenData } from '@/lib/auth';
import { getRoleFilter } from '@/lib/roleFilter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    await connectDB();

    const userData = await getTokenData(req);

    if (!userData) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleFilter = getRoleFilter(userData);

    // Block SYSTEM_ADMIN
    if (roleFilter === null) {
      return Response.json(
        { success: false, error: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    // Fetch all issues based on role filter
    const issues = await Issue.find(roleFilter)
      .select('reportId title description category subcategory status priority location upvotes upvotedBy createdAt updatedAt images reportedBy assignedDepartment assignedDepartmentCode ward')
      .populate('reportedBy', 'name email')
      .populate('assignedDepartment', 'name')
      .populate('upvotedBy', 'name')
      .sort({ 'sla.deadline': 1 })
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
