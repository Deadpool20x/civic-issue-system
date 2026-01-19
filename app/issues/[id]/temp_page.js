'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function IssueDetailPage() {
    const { user } = useUser();
    const router = useRouter();
    const params = useParams();
    const issueId = params.id;

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssue();
    }, [issueId]);

    const fetchIssue = async () => {
        try {
            const response = await fetch(`/api/issues/${issueId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch issue');
            }
            const data = await response.json();
            setIssue(data);
        } catch (error) {
            console.error('Error fetching issue:', error);
            toast.error('Failed to load issue details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-lg text-civic-text-secondary">Loading issue details...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!issue) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-lg text-civic-text-secondary">Issue not found</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-civic-card rounded-lg shadow-sm border border-civic-border p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-civic-text-primary mb-2">{issue.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-civic-text-secondary">
                                <span className="font-mono text-brand-primary font-medium">Report ID: {issue.reportId}</span>
                                <span>Category: {issue.category}</span>
                                <span>Priority: {issue.priority}</span>
                                <span>Status: {issue.status}</span>
                            </div>
                        </div>
                        {user && (user.role === 'admin' || user.role === 'municipal' || (user.role === 'citizen' && issue.reportedBy._id === user.userId)) && (
                            <button
                                onClick={() => router.push(`/issues/${issueId}/edit`)}
                                className="bg-civic-accent hover:bg-civic-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Edit Issue
                            </button>
                        )}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-civic-text-primary mb-2">Description</h2>
                        <p className="text-civic-text-secondary whitespace-pre-wrap">{issue.description}</p>
                    </div>

                    {issue.location && issue.location.address && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-civic-text-primary mb-2">Location</h2>
                            <p className="text-civic-text-secondary">{issue.location.address}</p>
                        </div>
                    )}

                    {issue.images && issue.images.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-civic-text-primary mb-2">Images</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {issue.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`Issue image ${index + 1}`}
                                        className="w-full h-48 object-cover rounded-lg border border-civic-border"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-civic-border pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-civic-text-primary mb-1">Reported By</h3>
                                <p className="text-civic-text-secondary">{issue.reportedBy?.name || 'Unknown'}</p>
                            </div>
                            {issue.assignedTo && (
                                <div>
                                    <h3 className="text-sm font-medium text-civic-text-primary mb-1">Assigned To</h3>
                                    <p className="text-civic-text-secondary">{issue.assignedTo?.name || 'Unknown'}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-medium text-civic-text-primary mb-1">Created</h3>
                                <p className="text-civic-text-secondary">{new Date(issue.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-civic-text-primary mb-1">Last Updated</h3>
                                <p className="text-civic-text-secondary">{new Date(issue.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}