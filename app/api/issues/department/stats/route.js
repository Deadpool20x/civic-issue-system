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
    
    const deptId = user.department._id;
    
    // Get statistics
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      highPriorityIssues
    ] = await Promise.all([
      Issue.countDocuments({ assignedDepartment: deptId }),
      Issue.countDocuments({ assignedDepartment: deptId, status: 'pending' }),
      Issue.countDocuments({ assignedDepartment: deptId, status: 'in-progress' }),
      Issue.countDocuments({ assignedDepartment: deptId, status: 'resolved' }),
      Issue.countDocuments({ assignedDepartment: deptId, priority: 'high' })
    ]);
    
    return Response.json({ 
      success: true,
      stats: {
        total: totalIssues,
        pending: pendingIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        highPriority: highPriorityIssues
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
