'use client';

const STATUS_CONFIG = {
  'submitted': {
    icon: '📝',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    borderColor: 'border-status-warning',
    label: 'Submitted'
  },
  'acknowledged': {
    icon: '✓',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-600',
    label: 'Acknowledged'
  },
  'assigned': {
    icon: '👤',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-600',
    label: 'Assigned'
  },
  'in-progress': {
    icon: '⚙️',
    color: 'text-brand-primary',
    bgColor: 'bg-brand-soft/30',
    borderColor: 'border-brand-primary',
    label: 'In Progress'
  },
  'resolved': {
    icon: '✅',
    color: 'text-status-success',
    bgColor: 'bg-status-success/10',
    borderColor: 'border-status-success',
    label: 'Resolved'
  },
  'rejected': {
    icon: '❌',
    color: 'text-status-error',
    bgColor: 'bg-status-error/10',
    borderColor: 'border-status-error',
    label: 'Rejected'
  },
  'reopened': {
    icon: '🔄',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    borderColor: 'border-status-warning',
    label: 'Reopened'
  },
  'escalated': {
    icon: '⚠️',
    color: 'text-status-error',
    bgColor: 'bg-status-error/10',
    borderColor: 'border-status-error',
    label: 'Escalated'
  }
};

export default function StatusTimeline({ history = [], currentStatus }) {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatRelativeTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  // Sort history by date (oldest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  if (sortedHistory.length === 0) {
    return (
      <div className="bg-neutral-bg rounded-xl p-8 text-center">
        <p className="text-contrast-secondary">No status history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sortedHistory.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG['submitted'];
        const isLatest = index === sortedHistory.length - 1;

        return (
          <div key={index} className="relative flex gap-4">
            {/* Timeline line */}
            {index !== sortedHistory.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-neutral-border" />
            )}

            {/* Icon */}
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center
              ${config.bgColor} ${config.borderColor} relative z-10
              ${isLatest ? 'ring-4 ring-brand-primary/20' : ''}
            `}>
              <span className="text-xl">{config.icon}</span>
            </div>

            {/* Content */}
            <div className={`
              flex-1 pb-6
              ${isLatest ? 'bg-brand-soft/20 -ml-2 -mt-2 pl-6 pt-2 pr-4 pb-4 rounded-xl border border-brand-primary/30' : ''}
            `}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h4 className={`font-semibold ${config.color} text-lg`}>
                    {config.label}
                    {isLatest && (
                      <span className="ml-2 text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-contrast-secondary mt-0.5">
                    {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
                <p className="text-xs text-contrast-light">
                  {formatDate(entry.timestamp)}
                </p>
              </div>

              {/* Admin name */}
              {entry.changedBy && (
                <p className="text-sm text-contrast-secondary mb-2">
                  <span className="font-medium">By:</span> {entry.changedBy.name || 'System'}
                  {entry.changedBy.role && (
                    <span className="ml-2 text-xs bg-neutral-bg px-2 py-0.5 rounded-full">
                      {entry.changedBy.role}
                    </span>
                  )}
                </p>
              )}

              {/* Comment/Notes */}
              {entry.comment && (
                <div className="mt-2 bg-neutral-bg rounded-lg p-3 border border-neutral-border">
                  <p className="text-sm text-contrast-primary">
                    💬 <span className="font-medium">Note:</span> {entry.comment}
                  </p>
                </div>
              )}

              {/* Department assignment */}
              {entry.assignedTo && (
                <p className="text-sm text-contrast-secondary mt-2">
                  <span className="font-medium">Assigned to:</span> {entry.assignedTo.name || entry.assignedTo}
                </p>
              )}

              {/* Rejection reason */}
              {entry.status === 'rejected' && entry.rejectionReason && (
                <div className="mt-2 bg-status-error/10 rounded-lg p-3 border border-status-error/30">
                  <p className="text-sm text-status-error">
                    <span className="font-medium">Reason:</span> {entry.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
