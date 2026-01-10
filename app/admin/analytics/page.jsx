'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/lib/components';
import toast from 'react-hot-toast';

export default function AdminAnalyticsPage() {
    const [overviewData, setOverviewData] = useState(null);
    const [departmentData, setDepartmentData] = useState([]);
    const [trendsData, setTrendsData] = useState([]);
    const [workflowData, setWorkflowData] = useState(null);
    const [stuckIssues, setStuckIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendsRange, setTrendsRange] = useState('7d');

    useEffect(() => {
        fetchAnalyticsData();
    }, [trendsRange]);

    const fetchAnalyticsData = async () => {
        try {
            // Fetch all analytics data in parallel
            const [overviewRes, departmentsRes, trendsRes, workflowRes, stuckRes] = await Promise.all([
                fetch('/api/admin/analytics/overview'),
                fetch('/api/admin/analytics/departments'),
                fetch(`/api/admin/analytics/trends?range=${trendsRange}`),
                fetch('/api/admin/analytics/workflow'),
                fetch('/api/admin/analytics/stuck?days=7')
            ]);

            // Handle each response separately to prevent one failure from breaking the entire page
            const overviewData = overviewRes.ok ? await overviewRes.json() : null;
            const departmentsData = departmentsRes.ok ? await departmentsRes.json() : [];
            const trendsData = trendsRes.ok ? await trendsRes.json() : [];
            const workflowData = workflowRes.ok ? await workflowRes.json() : null;
            const stuckData = stuckRes.ok ? await stuckRes.json() : [];

            setOverviewData(overviewData);
            setDepartmentData(departmentsData);
            setTrendsData(trendsData);
            setWorkflowData(workflowData);
            setStuckIssues(stuckData);

        } catch (error) {
            toast.error('Failed to load analytics data');
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format number with commas
    const formatNumber = (num) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
    };

    // Calculate max value for trends chart
    const getMaxTrendValue = () => {
        if (!trendsData.length) return 10;
        const maxReported = Math.max(...trendsData.map(item => item.issuesReported));
        const maxResolved = Math.max(...trendsData.map(item => item.issuesResolved));
        return Math.max(maxReported, maxResolved, 10);
    };

    return (
        <DashboardLayout>
            <DashboardProtection requiredRole="admin">
                <div className="p-6 lg:p-8">
                    <h1 className="text-2xl font-bold text-contrast-primary mb-8">Admin Analytics Dashboard</h1>

                    {/* Section 1: System Overview */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-contrast-primary mb-6">System Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Total Issues"
                                value={formatNumber(overviewData?.totalIssues || 0)}
                                iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                            <StatCard
                                label="Reported"
                                value={formatNumber(overviewData?.reportedCount || 0)}
                                iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                accent="border-l-4 border-l-status-warning"
                                iconBg="bg-status-warning/10"
                                iconColor="text-status-warning"
                            />
                            <StatCard
                                label="In Progress"
                                value={formatNumber(overviewData?.inProgressCount || 0)}
                                iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                                accent="border-l-4 border-l-brand-primary"
                                iconBg="bg-brand-soft/30"
                                iconColor="text-brand-primary"
                            />
                            <StatCard
                                label="Resolved"
                                value={formatNumber(overviewData?.resolvedCount || 0)}
                                iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                accent="border-l-4 border-l-status-success"
                                iconBg="bg-status-success/10"
                                iconColor="text-status-success"
                            />
                        </div>
                        {overviewData && (
                            <div className="mt-6">
                                <p className="text-sm text-contrast-secondary">
                                    Resolution Rate: <span className="font-semibold text-contrast-primary">
                                        {overviewData.resolutionPercentage}%
                                    </span>
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Section 2: Department Performance */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-contrast-primary mb-6">Department Performance</h2>
                        <Card className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-bg border-b border-neutral-border">
                                    <tr>
                                        <th className="p-4 font-semibold text-contrast-secondary">Department</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Total Assigned</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Resolved</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Pending</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Avg Resolution Time (hours)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departmentData.length > 0 ? (
                                        departmentData.map((dept) => (
                                            <tr key={dept.departmentId} className="border-b border-neutral-border hover:bg-neutral-bg">
                                                <td className="p-4 font-medium text-contrast-primary">{dept.departmentName}</td>
                                                <td className="p-4 text-contrast-secondary">{formatNumber(dept.totalAssignedIssues)}</td>
                                                <td className="p-4 text-contrast-secondary">{formatNumber(dept.resolvedIssues)}</td>
                                                <td className="p-4 text-contrast-secondary">{formatNumber(dept.pendingIssues)}</td>
                                                <td className="p-4 text-contrast-secondary">{dept.avgResolutionTime.toFixed(1)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-contrast-secondary">
                                                {loading ? 'Loading...' : 'No department data available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Card>
                    </section>

                    {/* Section 3: Trends */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-contrast-primary mb-6">Trends</h2>
                        <Card className="p-6">
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setTrendsRange('7d')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${trendsRange === '7d'
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-neutral-bg text-contrast-secondary hover:bg-neutral-bg/80'
                                        }`}
                                >
                                    Last 7 Days
                                </button>
                                <button
                                    onClick={() => setTrendsRange('30d')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${trendsRange === '30d'
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-neutral-bg text-contrast-secondary hover:bg-neutral-bg/80'
                                        }`}
                                >
                                    Last 30 Days
                                </button>
                            </div>

                            {trendsData.length > 0 ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Reported Issues Chart */}
                                        <div>
                                            <h3 className="text-sm font-medium text-contrast-secondary mb-3">Issues Reported</h3>
                                            <div className="space-y-4">
                                                {trendsData.map((item) => (
                                                    <div key={`reported-${item.date}`} className="flex items-center gap-4">
                                                        <div className="w-20 text-xs text-contrast-secondary">{new Date(item.date).toLocaleDateString()}</div>
                                                        <div className="flex-1 bg-neutral-bg rounded-full h-2">
                                                            <div
                                                                className="bg-status-warning h-2 rounded-full"
                                                                style={{ width: `${(item.issuesReported / getMaxTrendValue()) * 100}%` }}
                                                            />
                                                        </div>
                                                        <div className="w-8 text-right text-sm font-medium text-contrast-primary">{item.issuesReported}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Resolved Issues Chart */}
                                        <div>
                                            <h3 className="text-sm font-medium text-contrast-secondary mb-3">Issues Resolved</h3>
                                            <div className="space-y-4">
                                                {trendsData.map((item) => (
                                                    <div key={`resolved-${item.date}`} className="flex items-center gap-4">
                                                        <div className="w-20 text-xs text-contrast-secondary">{new Date(item.date).toLocaleDateString()}</div>
                                                        <div className="flex-1 bg-neutral-bg rounded-full h-2">
                                                            <div
                                                                className="bg-status-success h-2 rounded-full"
                                                                style={{ width: `${(item.issuesResolved / getMaxTrendValue()) * 100}%` }}
                                                            />
                                                        </div>
                                                        <div className="w-8 text-right text-sm font-medium text-contrast-primary">{item.issuesResolved}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-contrast-secondary">
                                    {loading ? 'Loading trends data...' : 'No trends data available'}
                                </div>
                            )}
                        </Card>
                    </section>

                    {/* Section 4: Workflow Integrity */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-contrast-primary mb-6">Workflow Integrity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 text-center">
                                <h3 className="text-sm font-medium text-contrast-secondary mb-2">Reported → In Progress</h3>
                                <p className="text-3xl font-bold text-brand-primary">{formatNumber(workflowData?.reportedToInProgressCount || 0)}</p>
                            </Card>
                            <Card className="p-6 text-center">
                                <h3 className="text-sm font-medium text-contrast-secondary mb-2">In Progress → Resolved</h3>
                                <p className="text-3xl font-bold text-status-success">{formatNumber(workflowData?.inProgressToResolvedCount || 0)}</p>
                            </Card>
                            <Card className="p-6 text-center">
                                <h3 className="text-sm font-medium text-contrast-secondary mb-2">Avg Transition Time (hours)</h3>
                                <p className="text-3xl font-bold text-contrast-primary">{workflowData?.avgTimePerTransition?.toFixed(1) || '0.0'}</p>
                            </Card>
                        </div>
                    </section>

                    {/* Section 5: Stuck Issues */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-contrast-primary mb-6">Stuck Issues</h2>
                        <Card className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-bg border-b border-neutral-border">
                                    <tr>
                                        <th className="p-4 font-semibold text-contrast-secondary">Issue Title</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Current Status</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Days in State</th>
                                        <th className="p-4 font-semibold text-contrast-secondary">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stuckIssues.length > 0 ? (
                                        stuckIssues.map((issue) => (
                                            <tr key={issue.issueId} className="border-b border-neutral-border hover:bg-neutral-bg">
                                                <td className="p-4 font-medium text-contrast-primary max-w-xs truncate">{issue.title}</td>
                                                <td className="p-4">
                                                    <StatusBadge status={issue.currentStatus} />
                                                </td>
                                                <td className="p-4 text-contrast-secondary">{issue.daysInCurrentState}</td>
                                                <td className="p-4 text-contrast-secondary">{issue.assignedDepartment}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-4 text-center text-contrast-secondary">
                                                {loading ? 'Loading...' : 'No stuck issues found'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Card>
                    </section>
                </div>
            </DashboardProtection>
        </DashboardLayout>
    );
}