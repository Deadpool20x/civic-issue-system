'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LoadingSpinner, EmptyState } from '@/lib/components';

/* PAGE 25: Public Map (Dark Theme) */

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
    const [filters, setFilters] = useState({ category: '', status: '', priority: '' });
    const [selectedIssue, setSelectedIssue] = useState(null);

    const inputCls = "bg-input border border-border rounded-input text-white focus:border-gold focus:outline-none w-full px-4 py-2 text-sm";

    const fetchIssues = async () => {
        try {
            setLoading(true); setError(null);
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);

            const res = await fetch(`/api/issues/public?${params.toString()}`);
            const data = await res.json();

            if (data.success) setIssues(data.issues || []);
            else throw new Error(data.error || 'Failed to fetch issues');
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError(err.message);
            setIssues([]);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchIssues(); }, [filters]);

    const handleMarkerClick = (issue) => setSelectedIssue(issue);

    return (
        <div className="min-h-screen bg-page text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Public Issue Map</h1>
                        <p className="text-text-secondary text-sm">
                            {loading ? 'Loading...' : `${issues.length} issues reported across the city`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/" className="btn-outline px-4 py-2 text-sm">Back to Home</Link>
                        <Link href="/public-dashboard" className="btn-gold px-4 py-2 text-sm">View Dashboard</Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-card rounded-card border border-border p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5 font-medium">Category</label>
                            <select value={filters.category} onChange={(e) => setFilters(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5 font-medium">Status</label>
                            <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-text-muted mb-1.5 font-medium">Priority</label>
                            <select value={filters.priority} onChange={(e) => setFilters(p => ({ ...p, priority: e.target.value }))} className={inputCls}>
                                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-card rounded-card border border-border p-4 mb-6 flex flex-wrap gap-x-6 gap-y-3">
                    <span className="text-sm font-semibold text-white mr-2">Legend:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-background"></div>
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-background"></div>
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Assigned / Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-background"></div>
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Resolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-background"></div>
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Rejected / Escalated</span>
                    </div>
                </div>

                {/* Map Container */}
                <div className="bg-card rounded-card border border-border overflow-hidden" style={{ height: 'calc(100vh - 360px)' }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                            <span className="text-sm text-text-secondary">Loading map data...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full p-4 text-center">
                            <div>
                                <h3 className="text-red-400 font-medium mb-2">Error loading map</h3>
                                <p className="text-text-secondary text-sm">{error}</p>
                                <button onClick={fetchIssues} className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-pill hover:bg-red-500/30 text-sm">
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : issues.length === 0 ? (
                        <div className="flex items-center justify-center h-full p-4">
                            <EmptyState
                                icon="🗺️"
                                title="No issues found"
                                description="No issues match the current filters. Try adjusting your filter settings."
                            />
                        </div>
                    ) : (
                        <IssueMap issues={issues} onMarkerClick={handleMarkerClick} />
                    )}
                </div>
            </div>
        </div>
    );
}
