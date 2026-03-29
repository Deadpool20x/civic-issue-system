'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-500/20 text-gray-400 border-gray-500/40', icon: '⏳' },
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: '📋' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: '🔧' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500/20 text-green-400 border-green-500/40', icon: '✅' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: '❌' },
];

export default function IssueStatusUpdater({ issue, currentUser, onUpdate }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [comment, setComment] = useState('');

    // Check if user can update status
    const canUpdateStatus = () => {
        if (!currentUser) return false;

        // Field Officers can update issues assigned to them
        if (currentUser.role === 'FIELD_OFFICER' || currentUser.role === 'department') {
            return true;
        }

        // Department Managers can update issues in their department
        if (currentUser.role === 'DEPARTMENT_MANAGER' || currentUser.role === 'municipal') {
            return true;
        }

        // Commissioners and Admins can update any issue
        if (['MUNICIPAL_COMMISSIONER', 'SYSTEM_ADMIN', 'commissioner', 'admin'].includes(currentUser.role)) {
            return true;
        }

        return false;
    };

    const handleStatusClick = (status) => {
        if (status === issue.status) return; // Same status, do nothing
        setSelectedStatus(status);
        setShowCommentBox(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;

        // Require comment when marking as resolved
        if (selectedStatus === 'resolved' && !comment.trim()) {
            toast.error('Please add a comment explaining what was done to resolve the issue');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: selectedStatus,
                    comment: comment || `Status updated to ${selectedStatus}`
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update status');
            }

            const updatedIssue = await res.json();
            toast.success(`Status updated to ${selectedStatus}`);
            setShowCommentBox(false);
            setSelectedStatus(null);
            setComment('');

            // Call parent callback to refresh issue data
            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setShowCommentBox(false);
        setSelectedStatus(null);
        setComment('');
    };

    if (!canUpdateStatus()) {
        return null; // Don't show anything if user can't update
    }

    return (
        <div className="bg-card rounded-card border border-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">Update Status</h3>

            {/* Status Options */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {STATUS_OPTIONS.map((option) => {
                    const isCurrent = option.value === issue.status;
                    const isSelected = option.value === selectedStatus;

                    return (
                        <button
                            key={option.value}
                            onClick={() => handleStatusClick(option.value)}
                            disabled={isCurrent || isUpdating}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all
                                ${isCurrent
                                    ? 'border-gold bg-gold/10 cursor-default'
                                    : isSelected
                                        ? 'border-gold bg-gold/5'
                                        : 'border-border hover:border-gold/50 hover:bg-white/5'
                                }
                                ${isCurrent || isUpdating ? 'opacity-60' : ''}
                            `}
                        >
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <div className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-gold' : 'text-white'
                                }`}>
                                {option.label}
                            </div>
                            {isCurrent && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-2 h-2 rounded-full bg-gold"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Comment Box */}
            {showCommentBox && (
                <div className="bg-background rounded-xl border border-border p-4 space-y-4 animate-fade-in">
                    <div>
                        <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                            Add Comment {selectedStatus === 'resolved' && <span className="text-red-400">*Required</span>}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={
                                selectedStatus === 'resolved'
                                    ? 'Explain what you did to resolve the issue (e.g., "Repaired pothole using cold asphalt. Work completed on March 7, 2024.")'
                                    : `Updating status to ${selectedStatus}...`
                            }
                            rows={3}
                            className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none transition-colors resize-none"
                        />
                        {selectedStatus === 'resolved' && (
                            <p className="text-xs text-amber-400 mt-2">
                                ⚠️ You must explain what was done to fix the issue before marking as resolved
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleUpdateStatus}
                            disabled={isUpdating}
                            className="flex-1 btn-gold py-2.5 text-sm font-bold disabled:opacity-50"
                        >
                            {isUpdating ? 'Updating...' : `Update to ${selectedStatus}`}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isUpdating}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Current Status Info */}
            <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-muted">Current Status:</span>
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_OPTIONS.find(s => s.value === issue.status)?.color || ''
                        }`}>
                        {STATUS_OPTIONS.find(s => s.value === issue.status)?.icon} {issue.status}
                    </span>
                </div>
            </div>
        </div>
    );
}
