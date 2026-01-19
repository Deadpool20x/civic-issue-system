'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DepartmentIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIssues();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchIssues();
        }, 30000);
        
        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    const fetchIssues = async () => {
        try {
            const response = await fetch('/api/issues/department/assigned');
            if (response.ok) {
                const data = await response.json();
                setIssues(data.issues);
            }
        } catch (error) {
            console.error('Error fetching issues:', error);
            setError('Failed to fetch issues');
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Assigned Issues</h1>
            <p className="text-gray-600 mb-6">Issues assigned to your department</p>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {issues.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No assigned issues
                        </h3>
                        <p className="text-gray-500">
                            There are no issues assigned to your department yet.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Report ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {issues.map((issue) => (
                                <tr key={issue._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm">{issue.reportId}</td>
                                    <td className="px-4 py-3">{issue.title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {issue.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/issues/${issue._id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
