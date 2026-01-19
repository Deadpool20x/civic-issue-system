'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LoadingSpinner, EmptyState } from '@/lib/components';

// Dynamically import the map component to avoid SSR issues
const IssueMap = dynamic(() => import('@/components/IssueMap'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>
});

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'roads-infrastructure', label: 'Roads & Infrastructure' },
    { value: 'street-lighting', label: 'Street Lighting' },
    { value: 'waste-management', label: 'Waste Management' },
    { value: 'water-drainage', label: 'Water & Drainage' },
    { value: 'parks-public-spaces', label: 'Parks & Public Spaces' },
    { value: 'traffic-signage', label: 'Traffic & Signage' },
    { value: 'public-health-safety', label: 'Public Health & Safety' },
    { value: 'other', label: 'Other' }
];

const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'reopened', label: 'Reopened' },
    { value: 'escalated', label: 'Escalated' }
];

const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
];

export default function PublicMapPage() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        priority: ''
    });
    const [selectedIssue, setSelectedIssue] = useState(null);

    // Fetch issues from API
    const fetchIssues = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);

            const response = await fetch(`/api/issues/public?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setIssues(data.issues || []);
            } else {
                throw new Error(data.error || 'Failed to fetch issues');
            }
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError(err.message);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchIssues();
    }, []);

    // Fetch when filters change
    useEffect(() => {
        fetchIssues();
    }, [filters.category, filters.status, filters.priority]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleMarkerClick = (issue) => {
        setSelectedIssue(issue);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">Public Issue Map</h1>
                        <p className="text-gray-600">
                            {loading ? 'Loading...' : `${issues.length} issues reported`}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/"
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {statuses.map((stat) => (
                                    <option key={stat.value} value={stat.value}>{stat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {priorities.map((prio) => (
                                    <option key={prio.value} value={prio.value}>{prio.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Marker Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-sm"></div>
                            <span className="text-sm text-gray-600">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                            <span className="text-sm text-gray-600">Assigned</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-700 rounded-full border-2 border-white shadow-sm"></div>
                            <span className="text-sm text-gray-600">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                            <span className="text-sm text-gray-600">Resolved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                            <span className="text-sm text-gray-600">Rejected/Escalated</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-600">Urgent Priority</span>
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <LoadingSpinner size="lg" message="Loading map data..." />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full p-4">
                            <div className="text-center">
                                <h3 className="text-red-600 font-medium mb-2">Error loading map</h3>
                                <p className="text-gray-600">{error}</p>
                                <button
                                    onClick={fetchIssues}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : issues.length === 0 ? (
                        <EmptyState
                            icon="🗺️"
                            title="No issues found"
                            description="No issues match the current filters. Try adjusting your filter settings."
                        />
                    ) : (
                        <IssueMap
                            issues={issues}
                            onMarkerClick={handleMarkerClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
