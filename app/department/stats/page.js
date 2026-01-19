'use client';

import { useState, useEffect } from 'react';

export default function DepartmentStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchStats();
        }, 30000);
        
        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/issues/department/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Statistics</h1>
            <p className="text-gray-600 mb-6">Department performance overview</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-sm text-gray-500 mb-1">Total Issues</div>
                    <div className="text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-sm text-gray-500 mb-1">Pending</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-sm text-gray-500 mb-1">In Progress</div>
                    <div className="text-3xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-sm text-gray-500 mb-1">Resolved</div>
                    <div className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-sm text-gray-500 mb-1">High Priority</div>
                    <div className="text-3xl font-bold text-red-600">{stats?.highPriority || 0}</div>
                </div>
            </div>
        </div>
    );
}
