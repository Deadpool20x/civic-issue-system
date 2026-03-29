import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

/**
 * GET /api/issues/track?reportId=R00042
 * 
 * PUBLIC endpoint - no authentication required
 * Returns limited public-safe data only
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId')?.toUpperCase().trim();

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find issue by reportId - return ONLY public-safe fields
    const issue = await Issue.findOne({ reportId })
      .select(
        'reportId title category status priority ward location.address ' +
        'assignedDepartmentCode sla.deadline sla.isOverdue ' +
        'createdAt updatedAt statusHistory'
      )
      .lean();

    if (!issue) {
      return NextResponse.json(
        { success: false, error: 'No complaint found with this ID' },
        { status: 404 }
      );
    }

    // Format the response - exclude any personal/sensitive data
    const responseData = {
      reportId: issue.reportId,
      title: issue.title,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      ward: issue.ward,
      address: issue.location?.address || 'Location not specified',
      department: issue.assignedDepartmentCode || 'Unassigned',
      sla: {
        deadline: issue.sla?.deadline,
        isOverdue: issue.sla?.isOverdue || false
      },
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      // Include status history for timeline (sanitized)
      statusHistory: issue.statusHistory?.map(entry => ({
        status: entry.status,
        timestamp: entry.timestamp,
        note: entry.note || null
      })) || []
    };

    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
