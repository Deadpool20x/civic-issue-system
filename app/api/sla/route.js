import { connectDB } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/lib/auth';
import Issue from '@/models/Issue';
import StaffPerformance from '@/models/StaffPerformance';
import DepartmentPerformance from '@/models/DepartmentPerformance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Get SLA dashboard data
export const GET = authMiddleware(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const department = searchParams.get('department');
        const ward = searchParams.get('ward');

        // Build query based on user role and filters
        let query = {};
        
        if (req.user.role === 'department') {
            query.assignedDepartment = req.user.department;
        }
        
        if (department) {
            query.assignedDepartment = department;
        }
        
        if (ward) {
            query.ward = ward;
        }

        // Get all issues with SLA data
        const issues = await Issue.find(query)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('assignedStaff', 'name email')
            .sort({ 'sla.deadline': 1 });

        // Calculate SLA statistics
        const totalIssues = issues.length;
        const overdueIssues = issues.filter(issue => issue.sla.isOverdue).length;
        const dueToday = issues.filter(issue => {
            const today = new Date();
            const deadline = new Date(issue.sla.deadline);
            return deadline.toDateString() === today.toDateString() && !issue.sla.isOverdue;
        }).length;
        const dueTomorrow = issues.filter(issue => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const deadline = new Date(issue.sla.deadline);
            return deadline.toDateString() === tomorrow.toDateString() && !issue.sla.isOverdue;
        }).length;

        // Calculate SLA compliance rate
        const resolvedIssues = issues.filter(issue => issue.status === 'resolved');
        const onTimeResolutions = resolvedIssues.filter(issue => {
            const resolutionTime = issue.resolutionTime;
            const expectedTime = issue.priority === 'urgent' ? 24 : 
                               issue.priority === 'high' ? 48 : 
                               issue.priority === 'medium' ? 72 : 120;
            return resolutionTime <= expectedTime;
        }).length;
        
        const slaComplianceRate = resolvedIssues.length > 0 ? 
            (onTimeResolutions / resolvedIssues.length) * 100 : 0;

        // Get escalation statistics
        const escalatedIssues = issues.filter(issue => issue.status === 'escalated');
        const escalationStats = {
            level1: escalatedIssues.filter(issue => issue.sla.escalationLevel === 1).length,
            level2: escalatedIssues.filter(issue => issue.sla.escalationLevel === 2).length,
            level3: escalatedIssues.filter(issue => issue.sla.escalationLevel === 3).length
        };

        // Get department performance
        const departmentStats = await DepartmentPerformance.find({});
        const departmentRankings = departmentStats
            .map(dept => ({
                department: dept.department,
                performanceScore: dept.getPerformanceScore(),
                slaComplianceRate: dept.slaComplianceRate,
                averageResolutionTime: dept.averageResolutionTime,
                totalIssuesResolved: dept.totalIssuesResolved
            }))
            .sort((a, b) => b.performanceScore - a.performanceScore);

        const response = {
            summary: {
                totalIssues,
                overdueIssues,
                dueToday,
                dueTomorrow,
                slaComplianceRate: Math.round(slaComplianceRate * 100) / 100
            },
            escalationStats,
            departmentRankings,
            issues: issues.map(issue => ({
                _id: issue._id,
                title: issue.title,
                priority: issue.priority,
                status: issue.status,
                assignedDepartment: issue.assignedDepartment,
                ward: issue.ward,
                sla: {
                    deadline: issue.sla.deadline,
                    hoursRemaining: issue.sla.hoursRemaining,
                    isOverdue: issue.sla.isOverdue,
                    escalationLevel: issue.sla.escalationLevel
                },
                reportedBy: issue.reportedBy,
                assignedTo: issue.assignedTo,
                assignedStaff: issue.assignedStaff,
                upvotes: issue.upvotes,
                createdAt: issue.createdAt
            }))
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching SLA data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Escalate issue manually
export const POST = roleMiddleware(['municipal', 'admin'])(async (req) => {
    try {
        const { issueId, reason } = await req.json();

        await connectDB();

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Escalate the issue
        await issue.escalate(reason);

        // Update department performance
        const deptPerf = await DepartmentPerformance.findOne({ department: issue.assignedDepartment });
        if (deptPerf) {
            await deptPerf.addEscalatedIssue();
        }

        // Update staff performance if assigned
        if (issue.assignedStaff) {
            const staffPerf = await StaffPerformance.findOne({ staffId: issue.assignedStaff });
            if (staffPerf) {
                await staffPerf.addEscalatedIssue();
            }
        }

        return new Response(
            JSON.stringify({ 
                message: 'Issue escalated successfully',
                escalationLevel: issue.sla.escalationLevel,
                escalatedTo: issue.getEscalationTarget()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error escalating issue:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
