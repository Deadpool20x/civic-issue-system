'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatusTimeline from '@/components/StatusTimeline';
import RatingModal from '@/components/RatingModal';
import IssueStatusUpdater from '@/components/IssueStatusUpdater';
import IssueManagementPanel from '@/components/IssueManagementPanel';
import IssueResponseEditor from '@/components/IssueResponseEditor';
import IssueComments from '@/components/IssueComments';
import toast from 'react-hot-toast';

/* PAGE 24: Issue Detail Page (Dark Theme) */

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'submitted': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'acknowledged': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'assigned': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'in-progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'resolved': 'bg-green-500/20 text-green-400 border border-green-500/40',
    'rejected': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'escalated': 'bg-red-600/20 text-red-300 border border-red-600/40',
};

export default function IssueDetailPage() {
    const params = useParams();
    const { user: currentUser, loading: userLoading } = useUser();
    const [issue, setIssue] = useState(null);
    const [stateHistory, setStateHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const iRes = await fetch(`/api/issues/${params.id}`);
                if (iRes.ok) {
                    const data = await iRes.json();
                    setIssue(data.issue);
                    setStateHistory(data.stateHistory || []);
                } else {
                    toast.error('Issue not found');
                }
            } catch { toast.error('Failed to load'); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [params.id]);

    const handleRatingSubmit = async (ratingData) => {
        try {
            const res = await fetch(`/api/issues/${issue._id}/rate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ratingData)
            });
            if (res.ok) {
                toast.success('Thank you for your feedback!');
                setShowRatingModal(false);
                const iRes = await fetch(`/api/issues/${params.id}`);
                if (iRes.ok) {
                    const data = await iRes.json();
                    setIssue(data.issue);
                }
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to submit rating');
            }
        } catch { toast.error('Error submitting rating'); }
    };

    const handleIssueUpdate = (updatedIssue) => {
        setIssue(updatedIssue);
        // Refresh to get updated state history
        window.location.reload();
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        </DashboardLayout>
    );

    if (!issue) return (
        <DashboardLayout>
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2">Issue Not Found</h2>
                <p className="text-text-secondary">The report you're looking for doesn't exist.</p>
            </div>
        </DashboardLayout>
    );

    const canRate = currentUser && issue.status === 'resolved' && issue.reportedBy?._id === currentUser._id && !issue.feedback;
    const hasRating = issue.feedback && issue.feedback.rating;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-card rounded-card border border-border p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-white">{issue.title}</h1>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>
                                    {issue.status}
                                </span>
                            </div>
                            <p className="font-mono text-sm text-gold font-semibold">{issue.reportId}</p>
                        </div>
                    </div>

                    {/* Prompts */}
                    {canRate && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-input p-4 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="font-semibold text-white">Issue Resolved!</p>
                                    <p className="text-sm text-green-400/80">Help us improve by rating this resolution</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRatingModal(true)} className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-pill font-medium text-sm transition-colors">
                                Rate Now
                            </button>
                        </div>
                    )}

                    {hasRating && (
                        <div className="bg-gold/10 border border-gold/20 rounded-input p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⭐</span>
                                <div>
                                    <p className="font-semibold text-gold mb-1">Your Rating</p>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <svg key={star} className={`w-5 h-5 ${star <= issue.feedback.rating ? 'fill-gold text-gold' : 'fill-none text-text-muted'}`} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 text-sm text-text-secondary">{issue.feedback.resolved ? '✓ Resolved' : '✗ Not Resolved'}</span>
                                    </div>
                                    {issue.feedback.comment && <p className="text-sm text-text-muted mt-2 italic">"{issue.feedback.comment}"</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {issue.upvotes > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-input p-4 mb-6 flex items-center gap-4">
                            <div className="bg-blue-500/20 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center text-xl">👍</div>
                            <div>
                                <p className="font-semibold text-blue-400 mb-0.5">{issue.upvotes} {issue.upvotes === 1 ? 'Person' : 'People'} Reported This</p>
                                <p className="text-xs text-text-muted">Multiple citizens are experiencing this issue in this area</p>
                            </div>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background rounded-xl p-5 border border-border">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Category</p>
                            <p className="text-white font-medium">{issue.category} <span className="text-text-secondary font-normal">/ {issue.subcategory}</span></p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Location</p>
                            <p className="text-white font-medium">{issue.location?.address}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Priority</p>
                            <p className="text-white font-medium capitalize">{issue.priority}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Department</p>
                            <p className="text-white font-medium capitalize">{issue.assignedDepartment || 'Unassigned'}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Description</p>
                        <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{issue.description}</p>
                    </div>

                    {issue.images?.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-border">
                            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Photos</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {issue.images.map((img, i) => (
                                    <div key={i} className="rounded-lg overflow-hidden border border-border aspect-video">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-card border border-border p-6">
                    <h2 className="section-header">Status History</h2>
                    <div className="mt-4">
                        <StatusTimeline history={stateHistory} currentStatus={issue.status} />
                    </div>
                </div>

                {/* Comments & Responses - For everyone to see and add */}
                <IssueComments
                    issue={issue}
                    currentUser={currentUser}
                    onUpdate={handleIssueUpdate}
                />

                {/* Response Editor - For Managers & Commissioner to edit/approve responses */}
                <IssueResponseEditor
                    issue={issue}
                    currentUser={currentUser}
                    onUpdate={handleIssueUpdate}
                />

                {/* Issue Management Panel - Only for Managers & Commissioner */}
                <IssueManagementPanel
                    issue={issue}
                    currentUser={currentUser}
                    onUpdate={handleIssueUpdate}
                />

                {/* Status Updater - For all authorized staff */}
                <IssueStatusUpdater
                    issue={issue}
                    currentUser={currentUser}
                    onUpdate={handleIssueUpdate}
                />

            </div>

            {showRatingModal && <RatingModal issue={issue} onClose={() => setShowRatingModal(false)} onSubmit={handleRatingSubmit} />}
        </DashboardLayout>
    );
}
