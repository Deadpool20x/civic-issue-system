'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function DepartmentDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all'
    });
    const { user } = useUser();
    const searchParams = useSearchParams();

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam === 'assigned') {
            setFilters(prev => ({ ...prev, status: 'in-progress' }));
        }
    }, [searchParams]);

    const fetchIssues = useCallback(async () => {
        if (!user?.department) return;

        try {
            let url = `/api/issues?department=${user.department}`;
            if (filters.status !== 'all') url += `&status=${filters.status}`;
            if (filters.priority !== 'all') url += `&priority=${filters.priority}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch issues');
            }
            const data = await response.json();
            setIssues(data);
        } catch (error) {
            toast.error('Failed to load issues');
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.department, filters]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const response = await fetch(`/api/issues/${issueId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    assignedTo: user.userId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update issue status');
            }

            toast.success('Issue status updated successfully');
            fetchIssues();
        } catch (error) {
            toast.error('Failed to update issue status');
            console.error('Error updating issue status:', error);
        }
    };

    const handleTakeIssue = async (issueId) => {
        try {
            const response = await fetch(`/api/issues/${issueId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignedTo: user.userId,
                    status: 'in-progress'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign issue');
            }

            toast.success('Issue assigned to you successfully');
            fetchIssues();
        } catch (error) {
            toast.error('Failed to assign issue');
            console.error('Error assigning issue:', error);
        }
    };

    const getStatusSummary = () => {
        return issues.reduce((acc, issue) => {
            acc[issue.status] = (acc[issue.status] || 0) + 1;
            return acc;
        }, {});
    };

    const getPrioritySummary = () => {
        return issues.reduce((acc, issue) => {
            acc[issue.priority] = (acc[issue.priority] || 0) + 1;
            return acc;
        }, {});
    };

    const statusSummary = getStatusSummary();
    const prioritySummary = getPrioritySummary();
    const myAssignedIssues = issues.filter(issue => issue.assignedTo?._id === user.userId);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-slate-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="max-w-7xl mx-auto space-y-6 pt-0 md:pt-0">
                    {/* Department Header */}
                    <Card>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {user.department?.charAt(0).toUpperCase() + user.department?.slice(1)} Department Dashboard
                        </h1>
                        <p className="text-slate-600">
                            Manage and resolve issues assigned to the {user.department} department
                        </p>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <StatCard
                            label="Total Issues"
                            value={issues.length}
                            accent="border-l-4 border-l-slate-400"
                            iconBg="bg-slate-100"
                            iconColor="text-slate-600"
                            iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                        <StatCard
                            label="My Assigned"
                            value={myAssignedIssues.length}
                            accent="border-l-4 border-l-blue-400"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                            iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                        <StatCard
                            label="Pending"
                            value={statusSummary.pending || 0}
                            accent="border-l-4 border-l-amber-400"
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                            iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 9 0 0118 0z"
                        />
                        <StatCard
                            label="In Progress"
                            value={statusSummary['in-progress'] || 0}
                            accent="border-l-4 border-l-blue-400"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                            iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                        <StatCard
                            label="Resolved"
                            value={statusSummary.resolved || 0}
                            accent="border-l-4 border-l-emerald-400"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </div>

                    {/* Priority Breakdown */}
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Priority Breakdown</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-red-50 rounded-xl">
                                <div className="text-3xl font-bold text-red-600">{prioritySummary.urgent || 0}</div>
                                <div className="text-sm font-medium text-red-800">Urgent</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-xl">
                                <div className="text-3xl font-bold text-orange-600">{prioritySummary.high || 0}</div>
                                <div className="text-sm font-medium text-orange-800">High</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-xl">
                                <div className="text-3xl font-bold text-yellow-600">{prioritySummary.medium || 0}</div>
                                <div className="text-sm font-medium text-yellow-800">Medium</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <div className="text-3xl font-bold text-slate-600">{prioritySummary.low || 0}</div>
                                <div className="text-sm font-medium text-slate-800">Low</div>
                            </div>
                        </div>
                    </Card>

                    {/* Filters */}
                    <Card className="flex flex-col sm:flex-row flex-wrap gap-4">
                        <select
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <button
                            onClick={() => setFilters({ status: 'pending', priority: 'all' })}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm transition-colors"
                        >
                            Show Unassigned
                        </button>
                    </Card>

                    {/* Issues Grid */}
                    <div className="grid gap-6">
                        {issues.map((issue) => (
                            <div key={issue._id} className="relative">
                                <IssueCard
                                    issue={issue}
                                    onStatusChange={handleStatusChange}
                                    userRole="department"
                                />
                                {issue.status === 'pending' && !issue.assignedTo && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <button
                                            onClick={() => handleTakeIssue(issue._id)}
                                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                                        >
                                            Take Issue
                                        </button>
                                    </div>
                                )}
                                {issue.assignedTo?._id === user.userId && (
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 shadow-sm">
                                            Assigned to me
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {issues.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-slate-900">No issues found</h3>
                            <p className="mt-2 text-slate-500">
                                No issues are currently assigned to the {user.department} department.
                            </p>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}