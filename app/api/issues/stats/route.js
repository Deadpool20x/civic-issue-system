// app/api/issues/stats/route.js
import { getRoleFilter } from '@/lib/roleFilter'
import { connectDB } from '@/lib/mongodb'
import { getUser, normalizeRole } from '@/lib/auth'
import Issue from '@/models/Issue'

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const userData = await getUser(request)
    
    if (!userData) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - admin, commissioner, department can all see stats
    const userRole = normalizeRole(userData.role);
    const allowedRoles = ['SYSTEM_ADMIN', 'MUNICIPAL_COMMISSIONER', 'DEPARTMENT_MANAGER', 'FIELD_OFFICER', 'CITIZEN'];
    
    if (!allowedRoles.includes(userRole)) {
        return Response.json({ error: 'Forbidden - Invalid role for stats' }, { status: 403 })
    }

    // Check if department manager has departmentId assigned
    if (userRole === 'DEPARTMENT_MANAGER' && !userData.departmentId) {
        return Response.json({ 
            success: false, 
            error: 'Department not assigned. Contact administrator.',
            data: { total: 0, resolved: 0, pending: 0, inProgress: 0, overdue: 0, slaHealth: 0 }
        }, { status: 200 })
    }

    // Check if field officer has wardId assigned
    if (userRole === 'FIELD_OFFICER' && !userData.wardId) {
        return Response.json({ 
            success: false, 
            error: 'Ward not assigned. Contact administrator.',
            data: { total: 0, resolved: 0, pending: 0, inProgress: 0, overdue: 0, slaHealth: 0 }
        }, { status: 200 })
    }

    let filter = getRoleFilter(userData)
    
    // For admin and commissioner, override filter to show all
    if (userRole === 'SYSTEM_ADMIN' || userRole === 'MUNICIPAL_COMMISSIONER') {
        filter = {}
    } else if (filter === null || (filter._id === null)) {
        return Response.json({ 
            success: false, 
            error: 'Access configuration error. Contact administrator.',
            data: { total: 0, resolved: 0, pending: 0, inProgress: 0, overdue: 0, slaHealth: 0 }
        }, { status: 200 })
    }

    await connectDB()

    const [total, resolved, pending, inProgress, overdue] = await Promise.all([
        Issue.countDocuments({ ...filter }),
        Issue.countDocuments({ ...filter, status: 'resolved' }),
        Issue.countDocuments({ ...filter, status: 'pending' }),
        Issue.countDocuments({ ...filter, status: 'in-progress' }),
        Issue.countDocuments({ ...filter, 'sla.isOverdue': true }),
    ])

    const slaHealth = total > 0
        ? Math.round(((total - overdue) / total) * 100)
        : 0

    return Response.json({
        success: true,
        data: { total, resolved, pending, inProgress, overdue, slaHealth }
    })
}
