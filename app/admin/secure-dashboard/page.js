'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import IssueCard from '@/components/IssueCard';
import toast from 'react-hot-toast';

export default function SecureAdminDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        department: 'all',
        priority: 'all',
        escalated: 'all'
    });

    const fetchIssues = useCallback(async () => {
        try {
            let url = '/api/issues/admin?';
            if (filters.status !== 'all') url += `status=${filters.status}&`;
            if (filters.department !== 'all') url += `department=${filters.department}&`;
            if (filters.priority !== 'all') url += `priority=${filters.priority}&`;
            if (filters.escalated !== 'all') url += `escalated=${filters.escalated === 'escalated'}`;

            const response = await fetch(url, {
                credentials: 'include'
            });
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
    }, [filters]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const response = await fetch(`/api/issues/admin`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    issueId, 
                    updates: { status: newStatus } 
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

    const getStatusSummary = () => {
        return issues.reduce((acc, issue) => {
            acc[issue.status] = (acc[issue.status] || 0) + 1;
            return acc;
        }, {});
    };

    const getEscalationSummary = () => {
        return issues.reduce((acc, issue) => {
            if (issue.sla?.escalationLevel > 1) {
                acc.escalated = (acc.escalated || 0) + 1;
            }
            if (issue.sla?.isOverdue) {
                acc.overdue = (acc.overdue || 0) + 1;
            }
            return acc;
        }, {});
    };

    const statusSummary = getStatusSummary();
    const escalationSummary = getEscalationSummary();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading secure dashboard...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">🔒 Secure Admin Dashboard</h1>
                            <p className="text-sm text-gray-600">Full access to all sensitive data and internal details</p>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                href="/municipal/sla-dashboard"
                                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                📊 SLA Dashboard
                            </Link>
                            <Link
                                href="/public-dashboard"
                                target="_blank"
                                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                🌐 Public View
                            </Link>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    🔒 Secure Admin Access
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>This dashboard shows <strong>ALL SENSITIVE DATA</strong> including personal details, exact locations, internal comments, and escalation history. This information is only visible to admin and municipal users.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
                            <p className="mt-2 text-3xl font-semibold">{issues.length}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-red-800">Escalated</h3>
                            <p className="mt-2 text-3xl font-semibold">{escalationSummary.escalated || 0}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-orange-800">Overdue</h3>
                            <p className="mt-2 text-3xl font-semibold">{escalationSummary.overdue || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-green-800">Resolved</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary.resolved || 0}</p>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                        <select
                            className="border rounded-md px-3 py-2"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="reopened">Reopened</option>
                            <option value="escalated">Escalated</option>
                        </select>

                        <select
                            className="border rounded-md px-3 py-2"
                            value={filters.department}
                            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                        >
                            <option value="all">All Departments</option>
                            <option value="water">Water</option>
                            <option value="electricity">Electricity</option>
                            <option value="roads">Roads</option>
                            <option value="garbage">Garbage</option>
                            <option value="parks">Parks</option>
                            <option value="other">Other</option>
                        </select>

                        <select
                            className="border rounded-md px-3 py-2"
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <select
                            className="border rounded-md px-3 py-2"
                            value={filters.escalated}
                            onChange={(e) => setFilters(prev => ({ ...prev, escalated: e.target.value }))}
                        >
                            <option value="all">All Issues</option>
                            <option value="escalated">Escalated Only</option>
                            <option value="normal">Normal Only</option>
                        </select>
                    </div>

                    {/* Issues Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {issues.map((issue) => (
                            <IssueCard
                                key={issue._id}
                                issue={issue}
                                onStatusChange={handleStatusChange}
                                userRole="admin"
                                showSensitiveData={true}
                            />
                        ))}
                    </div>

                    {issues.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">No issues found with current filters</div>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}
