import { connectDB } from '@/lib/mongodb';
import Issue from '@/models/Issue';
import DepartmentPerformance from '@/models/DepartmentPerformance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Public dashboard data (no authentication required)
export const GET = async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const ward = searchParams.get('ward');
        const department = searchParams.get('department');

        // Build query
        let query = {};
        if (ward) query.ward = ward;
        if (department) query.assignedDepartment = department;

        // Get issues data
        const issues = await Issue.find(query)
            .populate('reportedBy', 'name')
            .select('title status priority assignedDepartment ward upvotes createdAt sla feedback')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalIssues = issues.length;
        const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
        const pendingIssues = issues.filter(issue => issue.status === 'pending' || issue.status === 'assigned').length;
        const inProgressIssues = issues.filter(issue => issue.status === 'in-progress').length;
        const overdueIssues = issues.filter(issue => issue.sla.isOverdue).length;

        // Calculate resolution rate
        const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

        // Calculate SLA compliance
        const onTimeResolutions = issues.filter(issue => {
            if (issue.status !== 'resolved') return false;
            const expectedTime = issue.priority === 'urgent' ? 24 :
                issue.priority === 'high' ? 48 :
                    issue.priority === 'medium' ? 72 : 120;
            return issue.resolutionTime <= expectedTime;
        }).length;

        const slaComplianceRate = resolvedIssues > 0 ? (onTimeResolutions / resolvedIssues) * 100 : 0;

        // Department-wise statistics
        const departmentStats = {};
        issues.forEach(issue => {
            const dept = issue.assignedDepartment;
            if (!departmentStats[dept]) {
                departmentStats[dept] = {
                    department: dept,
                    totalIssues: 0,
                    resolvedIssues: 0,
                    pendingIssues: 0,
                    overdueIssues: 0,
                    averageResolutionTime: 0,
                    upvotes: 0
                };
            }

            departmentStats[dept].totalIssues++;
            if (issue.status === 'resolved') departmentStats[dept].resolvedIssues++;
            if (issue.status === 'pending' || issue.status === 'assigned') departmentStats[dept].pendingIssues++;
            if (issue.sla.isOverdue) departmentStats[dept].overdueIssues++;
            departmentStats[dept].upvotes += issue.upvotes;
        });

        // Calculate department averages
        Object.values(departmentStats).forEach(dept => {
            if (dept.resolvedIssues > 0) {
                dept.resolutionRate = (dept.resolvedIssues / dept.totalIssues) * 100;
            }
        });

        // Ward-wise statistics
        const wardStats = {};
        issues.forEach(issue => {
            const wardName = issue.ward || 'Unknown';
            if (!wardStats[wardName]) {
                wardStats[wardName] = {
                    ward: wardName,
                    totalIssues: 0,
                    resolvedIssues: 0,
                    pendingIssues: 0,
                    overdueIssues: 0,
                    upvotes: 0
                };
            }

            wardStats[wardName].totalIssues++;
            if (issue.status === 'resolved') wardStats[wardName].resolvedIssues++;
            if (issue.status === 'pending' || issue.status === 'assigned') wardStats[wardName].pendingIssues++;
            if (issue.sla.isOverdue) wardStats[wardName].overdueIssues++;
            wardStats[wardName].upvotes += issue.upvotes;
        });

        // Calculate ward resolution rates
        Object.values(wardStats).forEach(ward => {
            if (ward.totalIssues > 0) {
                ward.resolutionRate = (ward.resolvedIssues / ward.totalIssues) * 100;
            }
        });

        // Get most upvoted issues
        const mostUpvotedIssues = issues
            .filter(issue => issue.upvotes > 0)
            .sort((a, b) => b.upvotes - a.upvotes)
            .slice(0, 10)
            .map(issue => ({
                _id: issue._id,
                title: issue.title,
                department: issue.assignedDepartment,
                ward: issue.ward,
                upvotes: issue.upvotes,
                status: issue.status,
                priority: issue.priority,
                createdAt: issue.createdAt
            }));

        // Get recent issues
        const recentIssues = issues.slice(0, 20).map(issue => ({
            _id: issue._id,
            title: issue.title,
            department: issue.assignedDepartment,
            ward: issue.ward,
            status: issue.status,
            priority: issue.priority,
            upvotes: issue.upvotes,
            hoursRemaining: issue.sla.hoursRemaining,
            isOverdue: issue.sla.isOverdue,
            createdAt: issue.createdAt
        }));

        // Get department performance rankings
        const departmentPerformance = await DepartmentPerformance.find({})
            .sort({ slaComplianceRate: -1, totalIssuesResolved: -1 })
            .limit(10);

        const departmentRankings = departmentPerformance.map((dept, index) => ({
            rank: index + 1,
            department: dept.department,
            slaComplianceRate: dept.slaComplianceRate,
            totalIssuesResolved: dept.totalIssuesResolved,
            averageResolutionTime: dept.averageResolutionTime,
            performanceScore: dept.getPerformanceScore()
        }));

        const response = {
            summary: {
                totalIssues,
                resolvedIssues,
                pendingIssues,
                inProgressIssues,
                overdueIssues,
                resolutionRate: Math.round(resolutionRate * 100) / 100,
                slaComplianceRate: Math.round(slaComplianceRate * 100) / 100
            },
            departmentStats: Object.values(departmentStats).sort((a, b) => b.resolutionRate - a.resolutionRate),
            wardStats: Object.values(wardStats).sort((a, b) => b.resolutionRate - a.resolutionRate),
            mostUpvotedIssues,
            recentIssues,
            departmentRankings,
            lastUpdated: new Date().toISOString()
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            }
        });
    } catch (error) {
        console.error('Error fetching public dashboard data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
