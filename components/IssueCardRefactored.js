'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { StatusBadge, ImageGallery } from '@/lib/components';
import Card from './ui/Card';
import PrimaryButton from './ui/PrimaryButton';

/**
 * Issue header component - displays title, category icon, and basic info
 */
function IssueHeader({ issue }) {
    const categoryIcons = {
        water: '💧',
        electricity: '⚡',
        roads: '🛣️',
        garbage: '🗑️',
        parks: '🌳',
        other: '📝'
    };

    return (
        <div className="pb-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcons[issue.category] || '📝'}</span>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {issue.title}
                        </h3>
                        <p className="text-sm text-slate-500 capitalize">{issue.category} Issue</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Issue content component - displays description and images
 */
function IssueContent({ issue, isExpanded, onToggleExpanded }) {
    return (
        <>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {isExpanded ? issue.description : `${issue.description.slice(0, 120)}...`}
                {issue.description.length > 120 && (
                    <button
                        onClick={onToggleExpanded}
                        className="text-indigo-600 hover:text-indigo-800 ml-2 font-medium"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </p>

            <ImageGallery images={issue.images} maxDisplay={3} />
        </>
    );
}

/**
 * Issue footer component - displays metadata and action buttons
 */
function IssueFooter({ issue, userRole, onStatusChange, onUpvote, isUpvoting }) {
    const { user } = useUser();

    const handleStatusChange = async (newStatus) => {
        if (onStatusChange) {
            await onStatusChange(issue._id, newStatus);
        }
    };

    return (
        <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm mb-3">
                <div className="text-slate-500">
                    <span className="font-medium text-slate-700">Reported by:</span>
                    <span className="ml-1">
                        {user && user.userId === issue.reportedBy._id ?
                            issue.reportedBy.name :
                            'Anonymous User'
                        }
                    </span>
                    <span className="mx-2">•</span>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Upvote Button */}
                {user && (
                    <button
                        onClick={onUpvote}
                        disabled={isUpvoting}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {issue.upvotes || 0}
                    </button>
                )}
            </div>

            {/* SLA and Ward Information - Only for authorized users */}
            {(userRole === 'admin' || userRole === 'municipal') && (
                <>
                    {issue.sla && (
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                            <span>SLA Deadline:</span>
                            <span className={`font-medium ${issue.sla.isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                                {issue.sla.isOverdue ?
                                    `Overdue by ${Math.abs(issue.sla.hoursRemaining)}h` :
                                    `${issue.sla.hoursRemaining}h remaining`
                                }
                            </span>
                        </div>
                    )}

                    {issue.ward && (
                        <div className="text-xs text-slate-500 mb-3">
                            <span className="font-medium text-slate-700">Ward:</span> {issue.ward}
                        </div>
                    )}
                </>
            )}

            {/* Assigned Staff - Only for admin/municipal */}
            {userRole === 'admin' && issue.assignedStaff && issue.assignedStaff.name && (
                <div className="text-xs text-slate-500 mb-3">
                    <span className="font-medium text-slate-700">Assigned to:</span> {issue.assignedStaff.name}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-3">
                <Link
                    href={`/issues/${issue._id}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium group !ml-0"
                >
                    View Details
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                <div className="flex gap-2">
                    {/* Edit button for issue owner */}
                    {user && user.userId === issue.reportedBy._id && (
                        <PrimaryButton
                            as={Link}
                            href={`/issues/${issue._id}/edit`}
                            className="text-xs px-4 py-2"
                        >
                            Edit Issue
                        </PrimaryButton>
                    )}

                    {/* Status change dropdown for authorized users */}
                    {(userRole === 'admin' || userRole === 'municipal' || userRole === 'department') && (
                        <select
                            className="border border-slate-300 rounded-lg px-2 py-1 text-xs bg-white text-slate-700 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={issue.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="reopened">Reopened</option>
                            <option value="escalated">Escalated</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Comments section component
 */
function CommentsSection({ comments }) {
    if (!comments || comments.length === 0) return null;

    return (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 rounded-b-2xl -mx-6 -mb-6 mt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments ({comments.length})
            </h4>
            <div className="space-y-3">
                {comments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-slate-900">{comment.user.name}</span>
                            <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600">{comment.text}</p>
                    </div>
                ))}
                {comments.length > 2 && (
                    <p className="text-xs text-indigo-600 font-medium">+{comments.length - 2} more comments</p>
                )}
            </div>
        </div>
    );
}

/**
 * Enhanced IssueCard component with better modularity and error handling
 */
export default function IssueCard({ issue, onStatusChange, userRole, showSensitiveData = false }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpvoting, setIsUpvoting] = useState(false);
    const { user } = useUser();

    const handleUpvote = async () => {
        if (isUpvoting || !user) return;

        setIsUpvoting(true);
        try {
            const response = await fetch('/api/citizen-engagement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    issueId: issue._id,
                    action: 'upvote'
                })
            });

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to upvote');
            }
        } catch (error) {
            console.error('Error upvoting issue:', error);
            // Could show a toast notification here
        } finally {
            setIsUpvoting(false);
        }
    };

    // Validate required props
    if (!issue || !issue._id) {
        return (
            <div className="p-4 text-center text-slate-500">
                Invalid issue data
            </div>
        );
    }

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <IssueHeader issue={issue} />

            <div className="pb-4">
                <StatusBadge
                    status={issue.status}
                    priority={issue.priority}
                    sla={issue.sla}
                    escalationLevel={issue.sla?.escalationLevel}
                />

                <div className="mt-4">
                    <IssueContent
                        issue={issue}
                        isExpanded={isExpanded}
                        onToggleExpanded={() => setIsExpanded(!isExpanded)}
                    />
                </div>
            </div>

            <IssueFooter
                issue={issue}
                userRole={userRole}
                onStatusChange={onStatusChange}
                onUpvote={handleUpvote}
                isUpvoting={isUpvoting}
            />

            <CommentsSection comments={issue.comments} />
        </Card>
    );
}
