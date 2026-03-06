'use client';

import Link from 'next/link';

export default function IssueCard({ issue }) {
    const statusClass = `badge-${issue.status === 'in-progress' ? 'progress' : issue.status}`;
    const priorityClass = `badge-${issue.priority}`;

    return (
        <Link href={`/citizen/issues/${issue._id}`} className="card card-hover flex flex-col group h-full">
            <div className="flex justify-between items-start mb-4">
                <span className="report-id tracking-widest">{issue.reportId}</span>
                <div className="flex gap-2">
                    <span className={`badge ${priorityClass}`}>{issue.priority.toUpperCase()}</span>
                    <span className={`badge ${statusClass}`}>{issue.status.replace('-', ' ').toUpperCase()}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors line-clamp-1">
                {issue.title}
            </h3>

            <p className="text-text-secondary text-sm mb-6 line-clamp-2 flex-grow">
                {issue.description}
            </p>

            <div className="pt-4 border-t border-border mt-auto">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-text-muted">
                    <div className="flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="truncate max-w-[120px]">{issue.ward || 'Unknown Ward'}</span>
                    </div>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </Link>
    );
}
