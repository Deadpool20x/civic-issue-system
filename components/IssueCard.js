'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';

export default function IssueCard({ issue, onStatusChange, userRole, showSensitiveData = false }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpvoting, setIsUpvoting] = useState(false);
    const { user } = useUser();

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800 border border-amber-300',
        assigned: 'bg-blue-100 text-blue-800 border border-blue-300',
        'in-progress': 'bg-blue-100 text-blue-800 border border-blue-300',
        resolved: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        rejected: 'bg-red-100 text-red-800 border border-red-300',
        reopened: 'bg-orange-100 text-orange-800 border border-orange-300',
        escalated: 'bg-red-100 text-red-800 border border-red-300'
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-800 border border-gray-300',
        medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        high: 'bg-orange-100 text-orange-800 border border-orange-300',
        urgent: 'bg-red-100 text-red-800 border border-red-300'
    };

    const categoryIcons = {
        water: '💧',
        electricity: '⚡',
        roads: '🛣️',
        garbage: '🗑️',
        parks: '🌳',
        other: '📝'
    };

    const handleStatusChange = async (newStatus) => {
        if (onStatusChange) {
            await onStatusChange(issue._id, newStatus);
        }
    };

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
                // Refresh the page or update local state
                window.location.reload();
            }
        } catch (error) {
            console.error('Error upvoting issue:', error);
        } finally {
            setIsUpvoting(false);
        }
    };

    const getSLAStatusColor = (hoursRemaining, isOverdue) => {
        if (isOverdue) return 'text-red-800 bg-red-100 border border-red-300';
        if (hoursRemaining <= 6) return 'text-orange-800 bg-orange-100 border border-orange-300';
        if (hoursRemaining <= 24) return 'text-yellow-800 bg-yellow-100 border border-yellow-300';
        return 'text-green-800 bg-green-100 border border-green-300';
    };

    const getSLAStatusText = (hoursRemaining, isOverdue) => {
        if (isOverdue) return 'OVERDUE';
        if (hoursRemaining <= 6) return 'CRITICAL';
        if (hoursRemaining <= 24) return 'DUE SOON';
        return 'ON TRACK';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group">
            {/* Header Section */}
            <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryIcons[issue.category] || '📝'}</span>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {issue.title}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">{issue.category} Issue</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                        • {issue.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
                        {issue.priority.toUpperCase()} PRIORITY
                    </span>
                    {/* SLA Status */}
                    {issue.sla && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSLAStatusColor(issue.sla.hoursRemaining, issue.sla.isOverdue)}`}>
                            {getSLAStatusText(issue.sla.hoursRemaining, issue.sla.isOverdue)}
                        </span>
                    )}
                    {/* Escalation Level */}
                    {issue.sla?.escalationLevel > 1 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ESCALATED L{issue.sla.escalationLevel}
                        </span>
                    )}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {isExpanded ? issue.description : `${issue.description.slice(0, 120)}...`}
                    {issue.description.length > 120 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-indigo-600 hover:text-indigo-800 ml-2 font-medium"
                        >
                            {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </p>

                {/* Images Section */}
                {issue.images && issue.images.length > 0 && (
                    <div className="mb-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {issue.images.slice(0, 3).map((image, index) => (
                                <div key={index} className="relative h-20 w-20 flex-shrink-0">
                                    <Image
                                        src={image.url}
                                        alt={`Issue image ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg border border-gray-200"
                                    />
                                </div>
                            ))}
                            {issue.images.length > 3 && (
                                <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500 font-medium">+{issue.images.length - 3}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm mb-3">
                    <div className="text-gray-500">
                        <span className="font-medium text-gray-700">Reported by:</span>
                        {showSensitiveData || (user && user.userId === issue.reportedBy._id) ?
                            issue.reportedBy.name :
                            'Anonymous User'
                        }
                        <span className="mx-2">•</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Upvote Button */}
                    {user && (
                        <button
                            onClick={handleUpvote}
                            disabled={isUpvoting}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 border border-blue-300 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {issue.upvotes || 0}
                        </button>
                    )}
                </div>

                {/* SLA Countdown - Only for authorized users */}
                {issue.sla && (showSensitiveData || userRole === 'admin' || userRole === 'municipal') && (
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span>SLA Deadline:</span>
                        <span className={`font-medium ${issue.sla.isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                            {issue.sla.isOverdue ?
                                `Overdue by ${Math.abs(issue.sla.hoursRemaining)}h` :
                                `${issue.sla.hoursRemaining}h remaining`
                            }
                        </span>
                    </div>
                )}

                {/* Ward Information - Only for authorized users */}
                {issue.ward && (showSensitiveData || userRole === 'admin' || userRole === 'municipal') && (
                    <div className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">Ward:</span> {issue.ward}
                    </div>
                )}

                {/* Assigned Staff - Only for admin/municipal */}
                {showSensitiveData && issue.assignedStaff && issue.assignedStaff.name && (
                    <div className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">Assigned to:</span> {issue.assignedStaff.name}
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
                            <Link
                                href={`/issues/${issue._id}/edit`}
                                className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
                            >
                                Edit
                            </Link>
                        )}

                        {/* Status change dropdown for authorized users */}
                        {(userRole === 'admin' || userRole === 'municipal' || userRole === 'department') && (
                            <select
                                className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white text-gray-800 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Comments Section */}
            {issue.comments && issue.comments.length > 0 && (
                <div className="border-t bg-blue-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Comments ({issue.comments.length})
                    </h4>
                    <div className="space-y-3">
                        {issue.comments.slice(0, 2).map((comment, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 text-sm border border-blue-200">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600">{comment.text}</p>
                            </div>
                        ))}
                        {issue.comments.length > 2 && (
                            <p className="text-xs text-blue-600 font-medium">+{issue.comments.length - 2} more comments</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}