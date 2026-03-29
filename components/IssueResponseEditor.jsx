'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function IssueResponseEditor({ issue, currentUser, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedResponse, setEditedResponse] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Check if user can edit responses
    const canEditResponses = () => {
        console.log('[IssueResponseEditor] Checking permissions...');
        console.log('[IssueResponseEditor] currentUser:', currentUser);
        console.log('[IssueResponseEditor] currentUser.role:', currentUser?.role);

        if (!currentUser) {
            console.log('[IssueResponseEditor] No currentUser - returning false');
            return false;
        }

        // Department Managers can edit responses in their department
        if (currentUser.role === 'DEPARTMENT_MANAGER' || currentUser.role === 'municipal') {
            console.log('[IssueResponseEditor] User is Department Manager - returning true');
            return true;
        }

        // Commissioners and Admins can edit any response
        if (['MUNICIPAL_COMMISSIONER', 'SYSTEM_ADMIN', 'commissioner', 'admin'].includes(currentUser.role)) {
            console.log('[IssueResponseEditor] User is Commissioner/Admin - returning true');
            return true;
        }

        console.log('[IssueResponseEditor] User role not authorized - returning false');
        return false;
    };

    const handleStartEdit = () => {
        // Get the last comment/response from the issue
        const lastComment = issue.comments && issue.comments.length > 0
            ? issue.comments[issue.comments.length - 1].text
            : '';
        setEditedResponse(lastComment);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!editedResponse.trim()) {
            toast.error('Response cannot be empty');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: `[EDITED BY ${currentUser.role}] ${editedResponse}`,
                    editedBy: currentUser.userId,
                    editReason: 'Response modified by higher authority'
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update response');
            }

            const updatedIssue = await res.json();
            toast.success('Response updated successfully');
            setIsEditing(false);
            setEditedResponse('');

            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update response');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRejectResponse = async () => {
        if (!window.confirm('Are you sure you want to reject this response? The issue will be sent back to the officer.')) {
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'assigned', // Send back to assigned
                    comment: `[RESPONSE REJECTED BY ${currentUser.role}] Response not satisfactory. Please review and update.`,
                    rejectedBy: currentUser.userId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reject response');
            }

            const updatedIssue = await res.json();
            toast.success('Response rejected. Issue sent back to officer.');

            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reject response');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleApproveResolution = async () => {
        if (issue.status !== 'resolved') {
            toast.error('Can only approve resolved issues');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approvedBy: currentUser.userId,
                    approvalDate: new Date(),
                    comment: `[APPROVED BY ${currentUser.role}] Resolution verified and approved.`
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to approve resolution');
            }

            const updatedIssue = await res.json();
            toast.success('Resolution approved successfully');

            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to approve resolution');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!canEditResponses()) {
        return null; // Don't show for Field Officers and Citizens
    }

    const lastComment = issue.comments && issue.comments.length > 0
        ? issue.comments[issue.comments.length - 1]
        : null;

    const isResolved = issue.status === 'resolved';
    const isApproved = issue.approvedBy;

    return (
        <div className="bg-card rounded-card border border-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">
                📝 Response Management
                <span className="ml-2 text-xs font-normal text-text-muted">(Manager/Commissioner Only)</span>
            </h3>

            {/* Current Response Display */}
            {lastComment && !isEditing && (
                <div className="mb-4 bg-background rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="text-xs text-text-muted uppercase tracking-wider">
                            Last Response
                        </div>
                        {isApproved && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                                ✓ Approved
                            </span>
                        )}
                    </div>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {lastComment.text}
                    </p>
                    <div className="mt-2 text-xs text-text-muted">
                        {new Date(lastComment.timestamp || issue.updatedAt).toLocaleString()}
                    </div>
                </div>
            )}

            {/* Edit Mode */}
            {isEditing && (
                <div className="mb-4 space-y-4 animate-fade-in">
                    <div>
                        <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                            Edit Response
                        </label>
                        <textarea
                            value={editedResponse}
                            onChange={(e) => setEditedResponse(e.target.value)}
                            placeholder="Update the response..."
                            rows={5}
                            className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none resize-none"
                        />
                        <p className="text-xs text-text-muted mt-2">
                            Your edit will be marked as modified by {currentUser.role}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                            className="flex-1 btn-gold py-2.5 text-sm font-bold disabled:opacity-50"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedResponse('');
                            }}
                            disabled={isUpdating}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Edit Response */}
                    <button
                        onClick={handleStartEdit}
                        disabled={isUpdating}
                        className="p-4 bg-background hover:bg-white/5 border border-border hover:border-gold/50 rounded-xl transition-all text-left disabled:opacity-50"
                    >
                        <div className="text-2xl mb-2">✏️</div>
                        <div className="text-sm font-bold text-white mb-1">Edit Response</div>
                        <div className="text-xs text-text-muted">
                            Modify officer's response
                        </div>
                    </button>

                    {/* Reject Response */}
                    {!isResolved && (
                        <button
                            onClick={handleRejectResponse}
                            disabled={isUpdating}
                            className="p-4 bg-background hover:bg-red-500/10 border border-border hover:border-red-500/50 rounded-xl transition-all text-left disabled:opacity-50"
                        >
                            <div className="text-2xl mb-2">❌</div>
                            <div className="text-sm font-bold text-red-400 mb-1">Reject Response</div>
                            <div className="text-xs text-text-muted">
                                Send back to officer
                            </div>
                        </button>
                    )}

                    {/* Approve Resolution */}
                    {isResolved && !isApproved && (
                        <button
                            onClick={handleApproveResolution}
                            disabled={isUpdating}
                            className="p-4 bg-background hover:bg-green-500/10 border border-border hover:border-green-500/50 rounded-xl transition-all text-left disabled:opacity-50"
                        >
                            <div className="text-2xl mb-2">✅</div>
                            <div className="text-sm font-bold text-green-400 mb-1">Approve Resolution</div>
                            <div className="text-xs text-text-muted">
                                Verify and approve
                            </div>
                        </button>
                    )}

                    {/* Already Approved */}
                    {isResolved && isApproved && (
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <div className="text-2xl mb-2">✓</div>
                            <div className="text-sm font-bold text-green-400 mb-1">Already Approved</div>
                            <div className="text-xs text-green-400/70">
                                Resolution verified
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
                <div className="font-bold mb-1">💡 Response Management Options:</div>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li><span className="font-bold">Edit Response:</span> Modify the officer's response if incomplete or incorrect</li>
                    <li><span className="font-bold">Reject Response:</span> Send issue back to officer for better response</li>
                    {isResolved && <li><span className="font-bold">Approve Resolution:</span> Verify and approve the completed work</li>}
                </ul>
            </div>
        </div>
    );
}
