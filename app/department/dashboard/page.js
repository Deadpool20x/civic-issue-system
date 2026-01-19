'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DepartmentDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        resolved: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });
    const [departmentName, setDepartmentName] = useState('');

    // Fetch issues data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch department issues
            const response = await fetch('/api/issues/department');
            
            const data = await response.json();

            if (data.success) {
                let filteredIssues = data.issues || [];

                // Apply filters
                if (filters.status) {
                    filteredIssues = filteredIssues.filter(i => i.status === filters.status);
                }
                if (filters.priority) {
                    filteredIssues = filteredIssues.filter(i => i.priority === filters.priority);
                }
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    filteredIssues = filteredIssues.filter(i =>
                        i.reportId.toLowerCase().includes(searchLower) ||
                        i.title.toLowerCase().includes(searchLower)
                    );
                }

                setIssues(filteredIssues);
                setDepartmentName(data.departmentName || 'Your Department');

                // Calculate stats from all issues (not filtered)
                const calculatedStats = {
                    total: data.issues.length,
                    inProgress: data.issues.filter(i => i.status === 'in-progress').length,
                    resolved: data.issues.filter(i => i.status === 'resolved').length
                };

                setStats(calculatedStats);
            } else {
                throw new Error(data.error || 'Failed to fetch issues');
            }

        } catch (err) {
            console.error('❌ Fetch error:', err);
            setError(err.message);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchData();
        }, 30000);
        
        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    // Fetch when filters change
    useEffect(() => {
        fetchData();
    }, [filters.status, filters.priority, filters.search]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        const colors = {
            submitted: 'bg-yellow-100 text-yellow-800',
            acknowledged: 'bg-blue-100 text-blue-800',
            assigned: 'bg-purple-100 text-purple-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Get priority badge color
    const getPriorityBadgeColor = (priority) => {
        const colors = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Truncate text
    const truncate = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading issues...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>Error: {error}</p>
                <button
                    onClick={fetchData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Department Dashboard</h1>
                <p className="text-gray-600">{departmentName}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-sm text-gray-500 mb-1">Total Assigned</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-6">
                    <div className="text-sm text-blue-600 mb-1">In Progress</div>
                    <div className="text-2xl font-bold text-blue-800">{stats.inProgress}</div>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-6">
                    <div className="text-sm text-green-600 mb-1">Resolved</div>
                    <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by Report ID or Title"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Issues Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Report ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {issues.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center">
                                    <div className="text-6xl mb-4">📭</div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        No issues found
                                    </h3>
                                    <p className="text-gray-500">
                                        There are no issues assigned to your department yet.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            issues.map((issue) => (
                                <tr key={issue._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm">{issue.reportId}</td>
                                    <td className="px-4 py-3">{issue.title}</td>
                                    <td className="px-4 py-3">{issue.status}</td>
                                    <td className="px-4 py-3">{issue.priority}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
