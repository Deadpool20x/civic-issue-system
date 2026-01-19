'use client';
import { useState } from 'react';

export default function DuplicateModal({ duplicates, onSubmitAnyway, onUpvote, onClose }) {
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async () => {
    if (!selectedDuplicate) return;
    
    setLoading(true);
    await onUpvote(selectedDuplicate);
    setLoading(false);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': 'bg-status-warning/10 text-status-warning',
      'acknowledged': 'bg-blue-100 text-blue-700',
      'assigned': 'bg-purple-100 text-purple-700',
      'in-progress': 'bg-brand-primary/10 text-brand-primary',
    };
    return colors[status] || 'bg-neutral-bg text-contrast-secondary';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-status-warning/10 border-b border-status-warning/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-status-warning/20 rounded-full p-2">
              <svg className="w-6 h-6 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-contrast-primary">Similar Reports Found</h2>
              <p className="text-sm text-contrast-secondary">We found {duplicates.length} similar {duplicates.length === 1 ? 'report' : 'reports'} in this area</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <p className="text-sm text-contrast-secondary mb-4">
            These reports are in the same category and within 50 meters of your location. You can upvote an existing report instead of creating a duplicate.
          </p>

          <div className="space-y-3">
            {duplicates.map((duplicate) => (
              <div
                key={duplicate._id}
                onClick={() => setSelectedDuplicate(duplicate)}
                className={`
                  border-2 rounded-xl p-4 cursor-pointer transition-all
                  ${selectedDuplicate?._id === duplicate._id
                    ? 'border-brand-primary bg-brand-soft/20'
                    : 'border-neutral-border hover:border-brand-primary/50 hover:bg-neutral-bg'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-brand-primary">
                        {duplicate.reportId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(duplicate.status)}`}>
                        {duplicate.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-contrast-primary mb-1">
                      {duplicate.title}
                    </h3>
                    <p className="text-sm text-contrast-secondary line-clamp-2">
                      {duplicate.description}
                    </p>
                  </div>
                  
                  {/* Radio button */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3
                    ${selectedDuplicate?._id === duplicate._id
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-neutral-border'
                    }
                  `}>
                    {selectedDuplicate?._id === duplicate._id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-contrast-secondary mt-2">
                  <span>📍 {duplicate.location.address}</span>
                  <span>📅 {formatDate(duplicate.createdAt)}</span>
                  <span>👍 {duplicate.upvotes} {duplicate.upvotes === 1 ? 'person' : 'people'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-border px-6 py-4 bg-neutral-bg">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-neutral-border text-contrast-primary rounded-xl hover:bg-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSubmitAnyway}
              className="flex-1 px-4 py-3 bg-neutral-bg border-2 border-neutral-border text-contrast-primary rounded-xl hover:bg-white transition-colors font-medium"
            >
              Submit Anyway
            </button>
            <button
              onClick={handleUpvote}
              disabled={!selectedDuplicate || loading}
              className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Processing...' : 'Upvote Selected Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
