import Link from 'next/link';
import { StatusBadge } from '@/lib/components';
import PriorityBadge from '@/components/PriorityBadge';

export default function IssuePopup({ issue }) {
    if (!issue) return null;

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-[300px] p-3 bg-white rounded-lg shadow-lg">
            <div className="mb-2">
                <h3 className="font-semibold text-gray-800 truncate mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-2">ID: {issue.reportId}</p>
            </div>

            <div className="mb-3">
                <StatusBadge status={issue.status} />
            </div>

            <div className="mb-3">
                <PriorityBadge priority={issue.priority} size="sm" />
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Category:</span> {issue.category}
                </p>
                {issue.subcategory && (
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Subcategory:</span> {issue.subcategory}
                    </p>
                )}
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Address:</span> {issue.location?.address || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Reported:</span> {formatDate(issue.createdAt)}
                </p>
            </div>

            <div className="mb-3 flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-sm text-gray-600">{issue.upvotes} upvotes</span>
            </div>

            <Link
                href={`/issues/${issue.reportId}`}
                className="inline-block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
                View Details
            </Link>
        </div>
    );
}
