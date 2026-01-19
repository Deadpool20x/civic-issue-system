'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusTimeline from '@/components/StatusTimeline';
import RatingModal from '@/components/RatingModal';
import { StatusBadge } from '@/lib/components';
import toast from 'react-hot-toast';

export default function IssueDetailPage() {
    const params = useParams();
    const [issue, setIssue] = useState(null);
    const [stateHistory, setStateHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchIssueDetails();
        fetchCurrentUser();
    }, [params.id]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchIssueDetails = async () => {
        try {
            const response = await fetch(`/api/issues/${params.id}`);
            const data = await response.json();

            if (response.ok) {
                setIssue(data.issue);
                setStateHistory(data.stateHistory || []);
            } else {
                toast.error('Issue not found');
            }
        } catch (error) {
            console.error('Error fetching issue:', error);
            toast.error('Failed to load issue');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-contrast-secondary">Loading...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!issue) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-contrast-primary mb-4">Issue Not Found</h2>
                    <p className="text-contrast-secondary">The report you're looking for doesn't exist.</p>
                </div>
            </DashboardLayout>
        );
    }

    const handleRatingSubmit = async (ratingData) => {
        try {
            const response = await fetch(`/api/issues/${issue._id}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ratingData)
            });

            if (response.ok) {
                toast.success('Thank you for your feedback!');
                setShowRatingModal(false);
                fetchIssueDetails(); // Refresh to show rating
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to submit rating');
            }
        } catch (error) {
            toast.error('Error submitting rating');
            console.error('Rating error:', error);
        }
    };

    // Check if user can rate (is reporter and issue is resolved and not yet rated)
    const canRate = currentUser &&
                    issue.status === 'resolved' &&
                    issue.reportedBy?._id === currentUser._id &&
                    !issue.feedback;

    // Show existing rating if available
    const hasRating = issue.feedback && issue.feedback.rating;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-border p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-contrast-primary">
                                    {issue.title}
                                </h1>
                                <StatusBadge status={issue.status} />
                            </div>
                            <p className="font-mono text-sm text-brand-primary font-semibold">
                                {issue.reportId}
                            </p>
                        </div>
                    </div>

                    {/* ⭐ RATING PROMPT - Show if resolved and not yet rated ⭐ */}
                    {canRate && (
                        <div className="bg-status-success/10 border-2 border-status-success rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">✅</div>
                                    <div>
                                        <p className="font-semibold text-contrast-primary mb-1">
                                            Issue Resolved! How was your experience?
                                        </p>
                                        <p className="text-sm text-contrast-secondary">
                                            Help us improve by rating this resolution
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="bg-status-success text-white px-6 py-2 rounded-lg hover:bg-status-success/90 transition-colors font-medium whitespace-nowrap"
                                >
                                    Rate Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ⭐ DISPLAY EXISTING RATING ⭐ */}
                    {hasRating && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl">⭐</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-contrast-primary mb-2">
                                        Your Rating
                                    </p>
                                    <div className="flex items-center gap-2 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className="w-6 h-6"
                                                fill={star <= issue.feedback.rating ? '#FCD34D' : 'none'}
                                                stroke={star <= issue.feedback.rating ? '#FCD34D' : '#D1D5DB'}
                                                strokeWidth={2}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                />
                                            </svg>
                                        ))}
                                        <span className="ml-2 text-sm text-contrast-secondary">
                                            {issue.feedback.resolved ? '✓ Resolved' : '✗ Not Resolved'}
                                        </span>
                                    </div>
                                    {issue.feedback.comment && (
                                        <p className="text-sm text-contrast-secondary italic">
                                            "{issue.feedback.comment}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ⭐ PROMINENT UPVOTE DISPLAY ⭐ */}
                    {issue.upvotes > 0 && (
                        <div className="bg-brand-soft/40 border-2 border-brand-primary/40 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-brand-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                                    👍
                                </div>
                                <div className="flex-1">
                                    <p className="text-xl font-bold text-brand-primary mb-1">
                                        {issue.upvotes} {issue.upvotes === 1 ? 'Person' : 'People'} Reported This
                                    </p>
                                    <p className="text-sm text-contrast-secondary">
                                        Multiple citizens are experiencing the same issue in this area
                                    </p>
                                </div>
                            </div>
                            
                            {/* Show upvoters count */}
                            {issue.upvotedBy && issue.upvotedBy.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-brand-primary/20">
                                    <p className="text-xs text-contrast-secondary">
                                        Originally reported by {issue.reportedBy?.name || 'a citizen'},
                                        supported by {issue.upvotedBy.length} {issue.upvotedBy.length === 1 ? 'other person' : 'others'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Issue details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <p className="text-sm font-semibold text-contrast-secondary mb-1">Category</p>
                            <p className="text-contrast-primary">{issue.category}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-contrast-secondary mb-1">Subcategory</p>
                            <p className="text-contrast-primary">{issue.subcategory}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-contrast-secondary mb-1">Location</p>
                            <p className="text-contrast-primary">{issue.location?.address}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-contrast-secondary mb-1">Priority</p>
                            <p className="text-contrast-primary capitalize">{issue.priority}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <p className="text-sm font-semibold text-contrast-secondary mb-2">Description</p>
                        <p className="text-contrast-primary whitespace-pre-wrap">{issue.description}</p>
                    </div>

                    {/* Images */}
                    {issue.images && issue.images.length > 0 && (
                        <div className="mt-6">
                            <p className="text-sm font-semibold text-contrast-secondary mb-3">Photos</p>
                            <div className="grid grid-cols-3 gap-4">
                                {issue.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`Issue photo ${index + 1}`}
                                        className="rounded-lg border border-neutral-border w-full h-48 object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Timeline */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-border p-6">
                    <h2 className="text-xl font-bold text-contrast-primary mb-6">Status History</h2>
                    <StatusTimeline history={stateHistory} currentStatus={issue.status} />
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <RatingModal
                    issue={issue}
                    onClose={() => setShowRatingModal(false)}
                    onSubmit={handleRatingSubmit}
                />
            )}
        </DashboardLayout>
    );
}
