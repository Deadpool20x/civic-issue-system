'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import { StatusBadge, ImageGallery } from '@/lib/components';
import Card from './ui/Card';
import PrimaryButton from './ui/PrimaryButton';

const CATEGORY_ICONS = {
    water: '💧',
    electricity: '⚡',
    roads: '🛣️',
    garbage: '🗑️',
    parks: '🌳',
    other: '📝'
};

/**
 * Issue content component - displays description and images
 */
function IssueContent({ issue, isExpanded, onToggleExpanded }) {
    return (
        <>
            <p className="text-slate-600 text-sm leading-relaxed mb-4 px-0">
                {isExpanded ? issue.description : `${issue.description.slice(0, 120)}...`}
                {issue.description.length > 120 && (
                    <button
                        onClick={onToggleExpanded}
                        className="text-indigo-600 hover:text-indigo-800 ml-2 font-medium text-sm min-h-[44px] py-2 px-2 inline-flex items-center"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </p>
            <div className="px-0">
                <ImageGallery images={issue.images} maxDisplay={3} />
            </div>
        </>
    );
}

/**
 * Comments section component
 */
function CommentsSection({ comments }) {
    if (!comments || comments.length === 0) return null;

    return (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 -mx-6 -mb-6 mt-4 rounded-b-2xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments ({comments.length})
            </h4>
            <div className="space-y-3">
                {comments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-sm border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-slate-900">{comment.user.name}</span>
                            <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600">{comment.text}</p>
                    </div>
                ))}
                {comments.length > 2 && (
                    <p className="text-xs text-indigo-600 font-medium text-center py-2">+{comments.length - 2} more comments</p>
                )}
            </div>
        </div>
    );
}

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
        } finally {
            setIsUpvoting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (onStatusChange) {
            await onStatusChange(issue._id, newStatus);
        }
    };

    if (!issue || !issue._id) {
        return <div className="p-4 text-center text-slate-500">Invalid issue data</div>;
    }

    // Shared Footer Logic (Desktop/Tablet)
    const DesktopFooter = () => (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-medium text-slate-700">Reported by:</span>
                {user && user.userId === issue.reportedBy._id ? issue.reportedBy.name : 'Anonymous'}
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-3">
                {user && (
                    <button
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 rounded-full border border-slate-200 hover:bg-brand-soft/20 hover:border-brand-primary/30 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {issue.upvotes || 0}
                    </button>
                )}

                <Link
                    href={`/issues/${issue._id}`}
                    className="text-xs font-medium text-brand-primary hover:text-brand-primary flex items-center gap-1"
                >
                    Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                {/* Status Change Dropdown (Desktop) */}
                {(userRole === 'admin' || userRole === 'municipal' || userRole === 'department') && (
                    <select
                        className="text-xs border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer hover:text-brand-primary"
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
    );

    return (
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden p-0">

            {/* ================= MOBILE LAYOUT ( < 640px ) ================= */}
            <div className="sm:hidden p-5 flex flex-col gap-4">
                {/* Header: Status & Priority */}
                <div className="flex justify-between items-start">
                    <StatusBadge
                        status={issue.status}
                        priority={issue.priority}
                        sla={issue.sla}
                        escalationLevel={issue.sla?.escalationLevel}
                    />
                    <span className="text-xs text-slate-400 font-medium">
                        {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Title */}
                <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                        {issue.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="capitalize font-medium text-slate-700 flex items-center gap-1">
                            {CATEGORY_ICONS[issue.category]} {issue.category}
                        </span>
                        {issue.ward && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span>Ward: {issue.ward}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <IssueContent
                    issue={issue}
                    isExpanded={isExpanded}
                    onToggleExpanded={() => setIsExpanded(!isExpanded)}
                />

                {/* Actions Grid */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                    <Link
                        href={`/issues/${issue._id}`}
                        className="w-full min-h-[48px] flex items-center justify-center bg-brand-primary hover:bg-brand-primary text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                    >
                        View Details
                    </Link>

                    <div className="grid grid-cols-2 gap-3">
                        {user && (
                            <button
                                onClick={handleUpvote}
                                disabled={isUpvoting}
                                className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-brand-soft/20 hover:border-brand-primary/30 disabled:opacity-50 text-sm"
                            >
                                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                Upvote ({issue.upvotes || 0})
                            </button>
                        )}
                        {(userRole === 'admin' || userRole === 'municipal' || userRole === 'department') && (
                            <div className="relative">
                                <select
                                    className="w-full min-h-[48px] appearance-none bg-white border border-slate-200 text-slate-700 font-medium rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                    value={issue.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= DESKTOP LAYOUT ( >= 640px ) ================= */}
            <div className="hidden sm:block">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                                {CATEGORY_ICONS[issue.category] || '📝'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                    {issue.title}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="capitalize">{issue.category}</span>
                                    {issue.ward && (
                                        <>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>Ward: {issue.ward}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <StatusBadge
                            status={issue.status}
                            priority={issue.priority}
                            sla={issue.sla}
                            escalationLevel={issue.sla?.escalationLevel}
                        />
                    </div>

                    <div className="pl-14">
                        <IssueContent
                            issue={issue}
                            isExpanded={isExpanded}
                            onToggleExpanded={() => setIsExpanded(!isExpanded)}
                        />
                    </div>
                </div>
                <DesktopFooter />
            </div>

            <CommentsSection comments={issue.comments} />
        </Card>
    );
}
