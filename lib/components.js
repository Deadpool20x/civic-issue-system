import React from 'react';
import Image from 'next/image';

/**
 * Component utilities for the Civic Issue System
 */

/**
 * Error Boundary component for better error handling
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center bg-neutral-bg">
                    <div className="text-center p-8">
                        <div className="text-status-error mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-contrast-primary mb-2">Something went wrong</h3>
                        <p className="text-contrast-secondary mb-4">
                            {this.props.fallback || 'An error occurred while loading this component.'}
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Loading spinner component
 */
export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-2">
                <svg className={`animate-spin ${sizeClasses[size]}`} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {message && <p className="text-sm text-contrast-secondary">{message}</p>}
            </div>
        </div>
    );
}

/**
 * Empty state component
 */
export function EmptyState({
    icon = '📝',
    title = 'No data available',
    description = 'There are no items to display at the moment.',
    action = null
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-contrast-primary mb-2">{title}</h3>
            <p className="text-contrast-secondary mb-6 max-w-md">{description}</p>
            {action}
        </div>
    );
}

/**
 * Status badge component with unified design system
 * Design System: Status colors - Pending: Sunset, In Progress: Ocean, Resolved: Soft Green
 */
export function StatusBadge({ status, priority, sla, escalationLevel }) {
    const statusColors = {
        pending: 'bg-status-warning/10 text-status-warning border border-status-warning/30',
        assigned: 'bg-brand-soft/30 text-brand-primary border border-brand-primary/30',
        'in-progress': 'bg-brand-soft/30 text-brand-primary border border-brand-primary/30',
        resolved: 'bg-status-success/10 text-status-success border border-status-success/30',
        rejected: 'bg-status-error/10 text-status-error border border-status-error/30',
        reopened: 'bg-status-warning/10 text-status-warning border border-status-warning/30',
        escalated: 'bg-status-error/10 text-status-error border border-status-error/30'
    };

    const priorityColors = {
        low: 'bg-neutral-bg text-contrast-secondary border border-neutral-border',
        medium: 'bg-status-warning/10 text-status-warning border border-status-warning/30',
        high: 'bg-status-warning/15 text-status-warning border border-status-warning/40',
        urgent: 'bg-status-error/10 text-status-error border border-status-error/30'
    };

    const badges = [];

    if (status) {
        badges.push(
            <span key="status" className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                • {status.replace('-', ' ').toUpperCase()}
            </span>
        );
    }

    if (priority) {
        badges.push(
            <span key="priority" className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
                {priority.toUpperCase()} PRIORITY
            </span>
        );
    }

    if (sla) {
        const slaStatusColor = sla.isOverdue
            ? 'text-status-error bg-status-error/10 border border-status-error/30'
            : sla.hoursRemaining <= 6
                ? 'text-status-warning bg-status-warning/10 border border-status-warning/30'
                : sla.hoursRemaining <= 24
                    ? 'text-brand-primary bg-brand-soft/30 border border-brand-primary/30'
                    : 'text-status-success bg-status-success/10 border border-status-success/30';

        badges.push(
            <span key="sla" className={`px-3 py-1 rounded-full text-xs font-medium ${slaStatusColor}`}>
                {sla.isOverdue ? 'OVERDUE' : sla.hoursRemaining <= 6 ? 'CRITICAL' : sla.hoursRemaining <= 24 ? 'DUE SOON' : 'ON TRACK'}
            </span>
        );
    }

    if (escalationLevel && escalationLevel > 1) {
        badges.push(
            <span key="escalation" className="px-3 py-1 rounded-full text-xs font-medium bg-status-error/10 text-status-error border border-status-error/30">
                ESCALATED L{escalationLevel}
            </span>
        );
    }

    return <div className="flex flex-wrap gap-2">{badges}</div>;
}

/**
 * Image gallery component for issue images
 */
export function ImageGallery({ images, maxDisplay = 3 }) {
    if (!images || images.length === 0) return null;

    return (
        <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, maxDisplay).map((image, index) => (
                    <div key={index} className="relative h-20 w-20 flex-shrink-0">
                        <Image
                            src={image.url}
                            alt={`Issue image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg border border-neutral-border"
                        />
                    </div>
                ))}
                {images.length > maxDisplay && (
                    <div className="h-20 w-20 flex-shrink-0 bg-neutral-bg rounded-lg border border-neutral-border flex items-center justify-center">
                        <span className="text-xs text-contrast-light font-medium">+{images.length - maxDisplay}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Action button component with consistent styling
 */
export function ActionButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-brand-primary text-white hover:bg-brand-primary focus:ring-brand-primary',
        secondary: 'bg-contrast-light text-white hover:bg-contrast-primary focus:ring-contrast-light',
        danger: 'bg-status-error text-white hover:bg-status-error focus:ring-status-error',
        outline: 'border border-neutral-border text-contrast-secondary bg-neutral-surface hover:bg-neutral-bg focus:ring-brand-primary'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-lg'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}

/**
 * Modal component for confirmations and dialogs
 */
export function Modal({ isOpen, onClose, title, children, actions = null, size = 'md' }) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-contrast-light opacity-75"></div>
                </div>

                <div className={`inline-block align-bottom bg-neutral-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
                    {title && (
                        <div className="bg-neutral-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-contrast-primary">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="text-contrast-light hover:text-contrast-secondary transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {children}
                    </div>

                    {actions && (
                        <div className="bg-neutral-bg px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
