'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function IssueActionButtons({ issue, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [resolutionImages, setResolutionImages] = useState([]);

    const handleMarkInProgress = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/issues/${issue._id}/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'in-progress',
                    notes: ''
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update status');
            }

            toast.success('Issue marked as in progress');
            onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
            console.error('Error updating issue status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNotes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/issues/${issue._id}/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: issue.status,
                    notes: notes
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add notes');
            }

            toast.success('Notes added successfully');
            setShowNotesModal(false);
            setNotes('');
            onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to add notes');
            console.error('Error adding notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkResolved = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/issues/${issue._id}/update-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'resolved',
                    notes: notes,
                    resolutionImages: resolutionImages
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to mark as resolved');
            }

            toast.success('Issue marked as resolved');
            setShowResolutionModal(false);
            setNotes('');
            setResolutionImages([]);
            onUpdate();
        } catch (error) {
            toast.error(error.message || 'Failed to mark as resolved');
            console.error('Error marking issue as resolved:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }
        setResolutionImages(files);
    };

    return (
        <div className="flex gap-2">
            {issue.status === 'assigned' && (
                <button
                    onClick={handleMarkInProgress}
                    disabled={loading}
                    className="px-3 py-1 rounded text-xs font-medium bg-status-warning/10 text-status-warning hover:bg-status-warning/20 border border-status-warning/30 transition-colors"
                >
                    {loading ? 'Processing...' : 'Mark In Progress'}
                </button>
            )}

            <button
                onClick={() => setShowNotesModal(true)}
                disabled={loading}
                className="px-3 py-1 rounded text-xs font-medium bg-brand-soft/10 text-brand-primary hover:bg-brand-soft/20 border border-brand-soft/30 transition-colors"
            >
                Add Notes
            </button>

            {issue.status === 'in-progress' && (
                <button
                    onClick={() => setShowResolutionModal(true)}
                    disabled={loading}
                    className="px-3 py-1 rounded text-xs font-medium bg-status-success/10 text-status-success hover:bg-status-success/20 border border-status-success/30 transition-colors"
                >
                    Mark Resolved
                </button>
            )}

            {showNotesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-neutral-surface rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-contrast-primary mb-4">Add Notes</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-neutral-border rounded-lg px-3 py-2 bg-neutral-surface text-contrast-primary focus:outline-none focus:ring-2 focus:ring-brand-primary mb-4"
                            rows="4"
                            placeholder="Enter notes about this issue..."
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="px-4 py-2 rounded text-sm font-medium bg-neutral-border text-contrast-primary hover:bg-neutral-bg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNotes}
                                disabled={loading || !notes.trim()}
                                className="px-4 py-2 rounded text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showResolutionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-neutral-surface rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-contrast-primary mb-4">Mark as Resolved</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-neutral-border rounded-lg px-3 py-2 bg-neutral-surface text-contrast-primary focus:outline-none focus:ring-2 focus:ring-brand-primary mb-4"
                            rows="4"
                            placeholder="Describe the resolution (required)..."
                            required
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-contrast-primary mb-2">
                                Resolution Photos (optional, max 3)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="w-full border border-neutral-border rounded-lg px-3 py-2 bg-neutral-surface text-contrast-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowResolutionModal(false)}
                                className="px-4 py-2 rounded text-sm font-medium bg-neutral-border text-contrast-primary hover:bg-neutral-bg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkResolved}
                                disabled={loading || !notes.trim()}
                                className="px-4 py-2 rounded text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Mark Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}