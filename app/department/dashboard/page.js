'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import ErrorBoundary from '@/components/ErrorBoundary';
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
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="max-w-7xl mx-auto px-4 space-y-6 pt-0 md:pt-0">
                    {/* Department Header */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            {user.department?.charAt(0).toUpperCase() + user.department?.slice(1)} Department Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Manage and resolve issues assigned to the {user.department} department
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
                            <p className="mt-2 text-3xl font-semibold">{issues.length}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-blue-800">My Assigned</h3>
                            <p className="mt-2 text-3xl font-semibold">{myAssignedIssues.length}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary.pending || 0}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-orange-800">In Progress</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary['in-progress'] || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-green-800">Resolved</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary.resolved || 0}</p>
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Breakdown</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-red-600">{prioritySummary.urgent || 0}</div>
                                <div className="text-sm text-gray-600">Urgent</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-orange-600">{prioritySummary.high || 0}</div>
                                <div className="text-sm text-gray-600">High</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-yellow-600">{prioritySummary.medium || 0}</div>
                                <div className="text-sm text-gray-600">Medium</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-semibold text-gray-600">{prioritySummary.low || 0}</div>
                                <div className="text-sm text-gray-600">Low</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                        <select
                            className="border rounded-md px-3 py-3 min-h-[44px]"
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
                            className="border rounded-md px-3 py-3 min-h-[44px]"
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
                            className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 min-h-[44px]"
                        >
                            Show Unassigned
                        </button>
                    </div>

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
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={() => handleTakeIssue(issue._id)}
                                            className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 min-h-[44px]"
                                        >
                                            Take Issue
                                        </button>
                                    </div>
                                )}
                                {issue.assignedTo?._id === user.userId && (
                                    <div className="absolute top-2 left-2">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Assigned to me
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {issues.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
                            <p className="mt-2 text-gray-500">
                                No issues are currently assigned to the {user.department} department.
                            </p>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}
