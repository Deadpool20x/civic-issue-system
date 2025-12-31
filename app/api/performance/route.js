import { connectDB } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/lib/auth';
import StaffPerformance from '@/models/StaffPerformance';
import DepartmentPerformance from '@/models/DepartmentPerformance';
import Issue from '@/models/Issue';

// Get performance leaderboards
export const GET = authMiddleware(async (req) => {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'staff', 'department', 'ward'
        const period = searchParams.get('period') || 'current'; // 'current', 'monthly', 'yearly'
        const department = searchParams.get('department');
        const ward = searchParams.get('ward');

        let response = {};

        if (type === 'staff') {
            // Staff performance leaderboard
            let query = {};
            if (department) {
                query.department = department;
            }

            const staffPerformance = await StaffPerformance.find(query)
                .populate('staffId', 'name email department')
                .sort({ totalRewardPoints: -1, 'currentMonth.issuesResolved': -1 })
                .limit(50);

            response = {
                type: 'staff',
                period,
                leaderboard: staffPerformance.map((staff, index) => ({
                    rank: index + 1,
                    staffId: staff.staffId._id,
                    name: staff.staffId.name,
                    email: staff.staffId.email,
                    department: staff.staffId.department,
                    totalIssuesResolved: staff.totalIssuesResolved,
                    averageResolutionTime: staff.averageResolutionTime,
                    totalRewardPoints: staff.totalRewardPoints,
                    currentMonthResolved: staff.currentMonth.issuesResolved,
                    badges: staff.badges,
                    isTopPerformer: staff.isTopPerformer
                }))
            };

        } else if (type === 'department') {
            // Department performance leaderboard
            const departmentPerformance = await DepartmentPerformance.find({})
                .sort({ slaComplianceRate: -1, 'currentMonth.issuesResolved': -1 });

            response = {
                type: 'department',
                period,
                leaderboard: departmentPerformance.map((dept, index) => ({
                    rank: index + 1,
                    department: dept.department,
                    totalIssuesResolved: dept.totalIssuesResolved,
                    averageResolutionTime: dept.averageResolutionTime,
                    slaComplianceRate: dept.slaComplianceRate,
                    performanceScore: dept.getPerformanceScore(),
                    currentMonthResolved: dept.currentMonth.issuesResolved,
                    totalPenaltyPoints: dept.totalPenaltyPoints,
                    isTopDepartment: dept.isTopDepartment
                }))
            };

        } else if (type === 'ward') {
            // Ward-wise performance
            const wardQuery = {};
            if (ward) {
                wardQuery.ward = ward;
            }

            const issues = await Issue.find(wardQuery)
                .populate('reportedBy', 'name')
                .populate('assignedStaff', 'name');

            // Group by ward and calculate statistics
            const wardStats = {};
            issues.forEach(issue => {
                const wardName = issue.ward || 'Unknown';
                if (!wardStats[wardName]) {
                    wardStats[wardName] = {
                        ward: wardName,
                        totalIssues: 0,
                        resolvedIssues: 0,
                        overdueIssues: 0,
                        averageResolutionTime: 0,
                        slaComplianceRate: 0,
                        upvotes: 0,
                        departments: {}
                    };
                }

                wardStats[wardName].totalIssues++;
                if (issue.status === 'resolved') {
                    wardStats[wardName].resolvedIssues++;
                }
                if (issue.sla.isOverdue) {
                    wardStats[wardName].overdueIssues++;
                }
                wardStats[wardName].upvotes += issue.upvotes;

                // Track department performance in ward
                const dept = issue.assignedDepartment;
                if (!wardStats[wardName].departments[dept]) {
                    wardStats[wardName].departments[dept] = 0;
                }
                wardStats[wardName].departments[dept]++;
            });

            // Calculate averages and compliance rates
            Object.values(wardStats).forEach(ward => {
                if (ward.resolvedIssues > 0) {
                    ward.slaComplianceRate = ((ward.resolvedIssues - ward.overdueIssues) / ward.resolvedIssues) * 100;
                }
            });

            response = {
                type: 'ward',
                period,
                leaderboard: Object.values(wardStats)
                    .sort((a, b) => b.slaComplianceRate - a.slaComplianceRate)
                    .map((ward, index) => ({
                        rank: index + 1,
                        ...ward
                    }))
            };

        } else {
            // Overall performance summary
            const totalIssues = await Issue.countDocuments();
            const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
            const overdueIssues = await Issue.countDocuments({ 'sla.isOverdue': true });
            const escalatedIssues = await Issue.countDocuments({ status: 'escalated' });

            const topStaff = await StaffPerformance.find({})
                .populate('staffId', 'name email department')
                .sort({ totalRewardPoints: -1 })
                .limit(5);

            const topDepartments = await DepartmentPerformance.find({})
                .sort({ slaComplianceRate: -1 })
                .limit(5);

            response = {
                type: 'overall',
                summary: {
                    totalIssues,
                    resolvedIssues,
                    overdueIssues,
                    escalatedIssues,
                    resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
                    slaComplianceRate: resolvedIssues > 0 ? ((resolvedIssues - overdueIssues) / resolvedIssues) * 100 : 0
                },
                topStaff: topStaff.map(staff => ({
                    name: staff.staffId.name,
                    department: staff.staffId.department,
                    totalRewardPoints: staff.totalRewardPoints,
                    issuesResolved: staff.totalIssuesResolved
                })),
                topDepartments: topDepartments.map(dept => ({
                    department: dept.department,
                    slaComplianceRate: dept.slaComplianceRate,
                    issuesResolved: dept.totalIssuesResolved,
                    performanceScore: dept.getPerformanceScore()
                }))
            };
        }

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching performance data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

// Update performance metrics (called when issues are resolved/escalated)
export const POST = roleMiddleware(['municipal', 'admin'])(async (req) => {
    try {
        const { issueId, action, resolutionTime, wasOnTime } = await req.json();

        await connectDB();

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return new Response(
                JSON.stringify({ error: 'Issue not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (action === 'resolved') {
            // Update staff performance
            if (issue.assignedStaff) {
                let staffPerf = await StaffPerformance.findOne({ staffId: issue.assignedStaff });
                if (!staffPerf) {
                    staffPerf = new StaffPerformance({
                        staffId: issue.assignedStaff,
                        department: issue.assignedDepartment
                    });
                }
                await staffPerf.addResolvedIssue(resolutionTime || issue.resolutionTime);
            }

            // Update department performance
            let deptPerf = await DepartmentPerformance.findOne({ department: issue.assignedDepartment });
            if (!deptPerf) {
                deptPerf = new DepartmentPerformance({
                    department: issue.assignedDepartment
                });
            }
            await deptPerf.addResolvedIssue(resolutionTime || issue.resolutionTime, wasOnTime);

            // Update ward performance
            if (issue.ward) {
                await deptPerf.updateWardPerformance(issue.ward, resolutionTime || issue.resolutionTime, wasOnTime);
            }

        } else if (action === 'escalated') {
            // Update staff performance
            if (issue.assignedStaff) {
                let staffPerf = await StaffPerformance.findOne({ staffId: issue.assignedStaff });
                if (staffPerf) {
                    await staffPerf.addEscalatedIssue();
                }
            }

            // Update department performance
            let deptPerf = await DepartmentPerformance.findOne({ department: issue.assignedDepartment });
            if (deptPerf) {
                await deptPerf.addEscalatedIssue();
            }
        }

        return new Response(
            JSON.stringify({ message: 'Performance metrics updated successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating performance metrics:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
