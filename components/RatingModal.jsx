'use client';
import { useState } from 'react';

export default function RatingModal({ issue, onClose, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [resolved, setResolved] = useState(null); // true = yes, false = no
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (resolved === null) {
            alert('Please indicate if the issue was resolved');
            return;
        }

        if (rating === 0) {
            alert('Please provide a star rating');
            return;
        }

        setSubmitting(true);
        await onSubmit({ rating, resolved, comment });
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="bg-status-success/10 border-b border-status-success/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-status-success/20 rounded-full p-2">
                            <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-contrast-primary">Rate Your Experience</h2>
                            <p className="text-sm text-contrast-secondary">Report {issue.reportId} has been resolved</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Was it resolved? */}
                    <div>
                        <p className="text-sm font-semibold text-contrast-primary mb-3">
                            Was this issue actually resolved?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setResolved(true)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${resolved === true
                                        ? 'border-status-success bg-status-success/10 text-status-success'
                                        : 'border-neutral-border hover:border-status-success/50'
                                    }`}
                            >
                                <div className="text-3xl mb-1">👍</div>
                                <div className="text-sm font-medium">Yes, Resolved</div>
                            </button>
                            <button
                                onClick={() => setResolved(false)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${resolved === false
                                        ? 'border-status-error bg-status-error/10 text-status-error'
                                        : 'border-neutral-border hover:border-status-error/50'
                                    }`}
                            >
                                <div className="text-3xl mb-1">👎</div>
                                <div className="text-sm font-medium">No, Not Resolved</div>
                            </button>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                        <p className="text-sm font-semibold text-contrast-primary mb-3">
                            How would you rate the service?
                        </p>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <svg
                                        className="w-12 h-12"
                                        fill={(hoverRating || rating) >= star ? '#FCD34D' : 'none'}
                                        stroke={(hoverRating || rating) >= star ? '#FCD34D' : '#D1D5DB'}
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                        />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-contrast-secondary mt-2">
                            {rating === 0 && 'Click to rate'}
                            {rating === 1 && '⭐ Poor'}
                            {rating === 2 && '⭐⭐ Fair'}
                            {rating === 3 && '⭐⭐⭐ Good'}
                            {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                            {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                        </p>
                    </div>

                    {/* Feedback Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-contrast-primary mb-2">
                            Additional Feedback (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience or suggestions..."
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary resize-none"
                        />
                        <p className="text-xs text-contrast-secondary mt-1">
                            {comment.length}/500 characters
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-border px-6 py-4 bg-neutral-bg flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-3 border-2 border-neutral-border text-contrast-primary rounded-xl hover:bg-white transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || resolved === null || rating === 0}
                        className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </div>
            </div>
        </div>
    );
}
