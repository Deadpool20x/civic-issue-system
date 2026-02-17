import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';
import Department from '@/lib/models/Department';
import { getTokenData } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    await connectDB();
    
    const userData = await getTokenData(req);
    if (!userData || userData.role !== 'department') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const user = await User.findById(userData.userId).populate('department');
    if (!user.department) {
      return Response.json({ error: 'No department assigned' }, { status: 400 });
    }
    
    // Get resolved issues
    const issues = await Issue.find({ 
      assignedDepartment: user.department._id,
      status: { $in: ['resolved', 'closed'] }
    })
      .populate('reportedBy', 'name email')
      .populate('assignedDepartment', 'name')
      .sort({ updatedAt: -1 })
      .lean();
    
    return Response.json({ 
      success: true,
      issues,
      count: issues.length
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
