'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function IssueComments({ issue, currentUser, onUpdate }) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canAddComment = () => {
        if (!currentUser) return false;
        // All authenticated users can add comments
        return true;
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/issues/${issue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: newComment
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add comment');
            }

            const updatedIssue = await res.json();
            toast.success('Comment added successfully');
            setNewComment('');
            
            if (onUpdate) {
                onUpdate(updatedIssue);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            'CITIZEN': { label: 'Citizen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            'citizen': { label: 'Citizen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            'FIELD_OFFICER': { label: 'Field Officer', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
            'department': { label: 'Field Officer', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
            'DEPARTMENT_MANAGER': { label: 'Manager', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
            'municipal': { label: 'Manager', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
            'MUNICIPAL_COMMISSIONER': { label: 'Commissioner', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
            'commissioner': { label: 'Commissioner', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
            'SYSTEM_ADMIN': { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
            'admin': { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        };
        return badges[role] || { label: role, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    };

    const comments = issue.comments || [];

    return (
        <div className="bg-card rounded-card border border-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">
                💬 Comments & Responses
                <span className="ml-2 text-xs font-normal text-text-muted">({comments.length})</span>
            </h3>

            {/* Comments List */}
            {comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                    {comments.map((comment, index) => {
                        const badge = getRoleBadge(comment.user?.role);
                        const isSystemComment = comment.text?.includes('[EDITED BY') || 
                                               comment.text?.includes('[REJECTED BY') || 
                                               comment.text?.includes('[APPROVED BY');
                        
                        return (
                            <div 
                                key={index} 
                                className={`bg-background rounded-xl border p-4 ${
                                    isSystemComment ? 'border-gold/30 bg-gold/5' : 'border-border'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                                            <span className="text-black font-bold text-sm">
                                                {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">
                                                {comment.user?.name || 'Unknown User'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    {new Date(comment.createdAt || comment.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap mt-2">
                                    {comment.text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 mb-6">
                    <span className="text-4xl block mb-2">💬</span>
                    <p className="text-text-muted text-sm">No comments yet</p>
                </div>
            )}

            {/* Add Comment Form */}
            {canAddComment() && (
                <div className="border-t border-border pt-6">
                    <label className="text-xs text-text-secondary uppercase tracking-widest mb-2 block font-medium">
                        Add Comment / Response
                    </label>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your comment or response here... (e.g., 'Repaired the pothole using cold asphalt. Work completed on March 7.')"
                        rows={4}
                        className="w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-3 focus:border-gold focus:outline-none resize-none mb-3"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-text-muted">
                            {currentUser?.role === 'FIELD_OFFICER' || currentUser?.role === 'department' 
                                ? '💡 Tip: Add details about what you did to fix the issue'
                                : '💡 Tip: Add updates or ask questions about this issue'
                            }
                        </p>
                        <button
                            onClick={handleSubmitComment}
                            disabled={isSubmitting || !newComment.trim()}
                            className="btn-gold px-6 py-2.5 text-sm font-bold disabled:opacity-50"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
