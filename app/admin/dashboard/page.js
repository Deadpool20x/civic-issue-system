'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { StatusBadge } from '@/lib/components';
import PriorityBadge from '@/components/PriorityBadge';
import toast from 'react-hot-toast';

function AdminDashboardContent() {
    const [issues, setIssues] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [stats, setStats] = useState({
        totalIssues: 0,
        totalUsers: 0,
        departmentStats: {},
        avgRating: 0,
        totalRatings: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            console.log('🔍 Fetching admin issues...');
            
            // Try multiple endpoints to find which one works
            let issuesData = null;
            
            // Option 1: Try admin-specific endpoint
            try {
                const response = await fetch('/api/issues/admin');
                console.log('Admin endpoint response:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Admin endpoint data:', data);
                    issuesData = data.issues || data;
                }
            } catch (e) {
                console.log('Admin endpoint failed:', e.message);
            }
            
            // Option 2: Try general issues endpoint
            if (!issuesData) {
                try {
                    const response = await fetch('/api/issues');
                    console.log('General endpoint response:', response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('General endpoint data:', data);
                        issuesData = data.issues || data;
                    }
                } catch (e) {
                    console.log('General endpoint failed:', e.message);
                }
            }
            
            console.log('📦 Final issues data:', issuesData);
            console.log('📊 Issues count:', issuesData?.length);
            
            if (issuesData && Array.isArray(issuesData)) {
                setIssues(issuesData);
            } else {
                console.error('❌ Issues data is not an array:', typeof issuesData);
                setIssues([]);
            }
            
            // Fetch departments
            const deptsRes = await fetch('/api/departments');
            if (deptsRes.ok) {
                const deptsData = await deptsRes.json();
                console.log('📋 Departments:', deptsData);
                setDepartments(Array.isArray(deptsData) ? deptsData : []);
            }
            
            // Fetch stats
            const statsRes = await fetch('/api/stats');
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                console.log('📊 Stats:', statsData);
                
                // Process department stats
                const departmentStats = statsData.departmentStats.reduce((acc, dept) => {
                    acc[dept._id] = {
                        total: dept.total,
                        resolved: dept.resolved,
                        pending: dept.pending
                    };
                    return acc;
                }, {});

                // Calculate average rating
                const ratedIssues = (statsData.recentIssues || []).filter(issue => issue.feedback && issue.feedback.rating);
                const totalRatings = ratedIssues.length;
                const avgRating = totalRatings > 0
                    ? ratedIssues.reduce((sum, issue) => sum + issue.feedback.rating, 0) / totalRatings
                    : 0;

                setStats({
                    totalIssues: statsData.totalIssues,
                    totalUsers: statsData.totalUsers,
                    departmentStats,
                    avgRating: avgRating.toFixed(1),
                    totalRatings
                });
            }
            
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            toast.error('Failed to load data');
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateResolutionRate = () => {
        if (stats.totalIssues === 0) {
            return 0;
        }
        const totalResolved = Object.values(stats.departmentStats).reduce(
            (acc, dept) => acc + dept.resolved,
            0
        );
        return Math.round((totalResolved / stats.totalIssues) * 100);
    };

    const handleQuickAction = async (issueId, action, data = {}) => {
        setActionLoading(prev => ({ ...prev, [issueId]: action }));

        try {
            const response = await fetch(`/api/issues/${issueId}/quick-action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...data })
            });

            if (response.ok) {
                toast.success(`Issue ${action}d successfully`);
                fetchData(); // Refresh data
            } else {
                const error = await response.json();
                toast.error(error.error || 'Action failed');
            }
        } catch (error) {
            console.error('Quick action error:', error);
            toast.error('Failed to perform action');
        } finally {
            setActionLoading(prev => ({ ...prev, [issueId]: null }));
        }
    };

    const handleAcknowledge = (issueId) => {
        handleQuickAction(issueId, 'acknowledge');
    };

    const handleReject = (issueId) => {
        const reason = window.prompt('Rejection reason (optional):');
        if (reason !== null) { // User clicked OK (even if empty)
            handleQuickAction(issueId, 'reject', { reason });
        }
    };

    const handleAssign = (issueId, departmentId) => {
        if (!departmentId) {
            toast.error('Please select a department');
            return;
        }
        handleQuickAction(issueId, 'assign', { departmentId });
    };

    // Filter issues
    const filteredIssues = issues.filter(issue => {
        const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
        const priorityMatch = filterPriority === 'all' || issue.priority === filterPriority;
        return statusMatch && priorityMatch;
    });

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-contrast-secondary">Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-contrast-primary">Admin Dashboard</h1>
                    
                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="all">All Issues ({issues.length})</option>
                            <option value="submitted">Submitted ({issues.filter(i => i.status === 'submitted').length})</option>
                            <option value="acknowledged">Acknowledged ({issues.filter(i => i.status === 'acknowledged').length})</option>
                            <option value="assigned">Assigned ({issues.filter(i => i.status === 'assigned').length})</option>
                            <option value="in-progress">In Progress ({issues.filter(i => i.status === 'in-progress').length})</option>
                            <option value="resolved">Resolved ({issues.filter(i => i.status === 'resolved').length})</option>
                            <option value="rejected">Rejected ({issues.filter(i => i.status === 'rejected').length})</option>
                        </select>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-2 border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">🔴 Urgent ({issues.filter(i => i.priority === 'urgent').length})</option>
                            <option value="high">🟠 High ({issues.filter(i => i.priority === 'high').length})</option>
                            <option value="medium">🟡 Medium ({issues.filter(i => i.priority === 'medium').length})</option>
                            <option value="low">🟢 Low ({issues.filter(i => i.priority === 'low').length})</option>
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Total Issues"
                        value={stats.totalIssues}
                        accent="border-l-4 border-l-contrast-light"
                        iconBg="bg-neutral-bg"
                        iconColor="text-contrast-light"
                        iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                    <StatCard
                        label="Total Users"
                        value={stats.totalUsers}
                        accent="border-l-4 border-l-contrast-light"
                        iconBg="bg-neutral-bg"
                        iconColor="text-contrast-light"
                        iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                    <StatCard
                        label="Resolution Rate"
                        value={`${calculateResolutionRate()}%`}
                        accent="border-l-4 border-l-contrast-light"
                        iconBg="bg-neutral-bg"
                        iconColor="text-contrast-light"
                        iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <StatCard
                        label="Avg Citizen Rating"
                        value={stats.totalRatings > 0 ? `${stats.avgRating} ⭐` : 'N/A'}
                        accent="border-l-4 border-l-status-success"
                        iconBg="bg-status-success/10"
                        iconColor="text-status-success"
                        iconPath="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </div>

                {/* Department Performance */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-neutral-border">
                        <h3 className="text-lg font-bold text-contrast-primary">
                            Department Performance
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {Object.entries(stats.departmentStats).map(([dept, data]) => (
                            <div key={dept} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <h4 className="font-semibold text-contrast-primary capitalize">
                                        {dept}
                                    </h4>
                                    <span className="text-contrast-light">
                                        {data.resolved} / {data.total} resolved
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-bg rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-brand-primary h-2.5 rounded-full"
                                        style={{
                                            width: `${Math.round(
                                                (data.resolved / data.total) * 100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* DEBUG INFO - Remove after fixing */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-yellow-900 mb-2">🐛 Debug Info:</p>
                    <p className="text-sm text-yellow-800">Issues array length: {issues.length}</p>
                    <p className="text-sm text-yellow-800">Issues array type: {Array.isArray(issues) ? 'Array' : typeof issues}</p>
                    <p className="text-sm text-yellow-800">Filtered issues: {filteredIssues.length}</p>
                    <p className="text-sm text-yellow-800">Current filter: {filterStatus}</p>
                    <p className="text-sm text-yellow-800">Loading: {loading ? 'Yes' : 'No'}</p>
                    {issues.length > 0 && (
                        <details className="mt-2">
                            <summary className="text-sm text-yellow-800 cursor-pointer">View raw data</summary>
                            <pre className="text-xs mt-2 overflow-auto max-h-40 bg-white p-2 rounded">
                                {JSON.stringify(issues, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Issues Table with Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-border overflow-hidden">
                    <div className="p-4 border-b border-neutral-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-contrast-primary">
                            Issues Management
                        </h3>
                        <span className="text-sm text-contrast-secondary">
                            {filteredIssues.length} issues
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-bg border-b border-neutral-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Report ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Priority
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Reported
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-contrast-secondary uppercase">
                                        Quick Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-border">
                                {filteredIssues.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-contrast-secondary">
                                            No issues found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIssues.map((issue) => (
                                        <tr key={issue._id} className="hover:bg-neutral-bg transition-colors">
                                            <td className="px-4 py-3">
                                                <a
                                                    href={`/issues/${issue.reportId || issue._id}`}
                                                    className="font-mono text-sm font-semibold text-brand-primary hover:underline"
                                                >
                                                    {issue.reportId}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-contrast-primary font-medium max-w-xs truncate">
                                                    {issue.title}
                                                </p>
                                                <p className="text-xs text-contrast-secondary">
                                                    {issue.location?.address?.substring(0, 40)}...
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-contrast-secondary">
                                                    {issue.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={issue.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <PriorityBadge priority={issue.priority} size="sm" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-contrast-secondary">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {/* Quick Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {/* Acknowledge Button - Only for submitted issues */}
                                                    {issue.status === 'submitted' && (
                                                        <button
                                                            onClick={() => handleAcknowledge(issue._id)}
                                                            disabled={actionLoading[issue._id]}
                                                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Acknowledge this issue"
                                                        >
                                                            {actionLoading[issue._id] === 'acknowledge' ? '...' : '✓ Acknowledge'}
                                                        </button>
                                                    )}

                                                    {/* Assign Dropdown - For submitted or acknowledged issues */}
                                                    {['submitted', 'acknowledged'].includes(issue.status) && (
                                                        <select
                                                            onChange={(e) => handleAssign(issue._id, e.target.value)}
                                                            disabled={actionLoading[issue._id]}
                                                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-medium disabled:opacity-50 border-none cursor-pointer"
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>📋 Assign to...</option>
                                                            {departments.map(dept => (
                                                                <option key={dept._id} value={dept._id}>
                                                                    {dept.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {/* Reject Button - For non-rejected, non-resolved issues */}
                                                    {!['rejected', 'resolved'].includes(issue.status) && (
                                                        <button
                                                            onClick={() => handleReject(issue._id)}
                                                            disabled={actionLoading[issue._id]}
                                                            className="px-3 py-1.5 bg-status-error/10 text-status-error rounded-lg hover:bg-status-error/20 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Reject this issue"
                                                        >
                                                            {actionLoading[issue._id] === 'reject' ? '...' : '✗ Reject'}
                                                        </button>
                                                    )}

                                                    {/* View Details Link */}
                                                    <a
                                                        href={`/issues/${issue.reportId || issue._id}`}
                                                        className="px-3 py-1.5 bg-neutral-bg text-contrast-secondary rounded-lg hover:bg-neutral-border transition-colors text-xs font-medium"
                                                        title="View full details"
                                                    >
                                                        View →
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Citizen Satisfaction */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-contrast-primary mb-4">
                        Citizen Satisfaction
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-status-success/10 rounded-xl">
                            <p className="text-4xl font-bold text-status-success mb-2">
                                {stats.totalRatings > 0 ? stats.avgRating : 'N/A'}
                            </p>
                            <p className="text-sm text-contrast-secondary">
                                Average Rating ({stats.totalRatings} ratings)
                            </p>
                        </div>
                        <div className="text-center p-4 bg-brand-soft/10 rounded-xl">
                            <p className="text-4xl font-bold text-brand-primary mb-2">
                                {stats.totalRatings}
                            </p>
                            <p className="text-sm text-contrast-secondary">
                                Total Citizen Feedbacks
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}

export default function AdminDashboard() {
    return (
        <DashboardProtection requiredRole="admin">
            <AdminDashboardContent />
        </DashboardProtection>
    );
}