'use client';

import { useState } from 'react';

export default function PrivacyNotice({ userRole, showDetails = false }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getPrivacyLevel = () => {
        switch (userRole) {
            case 'admin':
            case 'municipal':
                return {
                    level: 'Full Access',
                    color: 'error',
                    description: 'Can see all personal details, locations, and internal data'
                };
            case 'department':
                return {
                    level: 'Department Access',
                    color: 'warning',
                    description: 'Can see department-related issues with limited personal details'
                };
            case 'citizen':
                return {
                    level: 'Personal Access',
                    color: 'primary',
                    description: 'Can only see your own issues with full details'
                };
            default:
                return {
                    level: 'Public Access',
                    color: 'success',
                    description: 'Can only see anonymized public information'
                };
        }
    };

    const privacyLevel = getPrivacyLevel();

    if (!showDetails) return null;

    const getColorClasses = () => {
        switch (privacyLevel.color) {
            case 'error':
                return {
                    container: 'bg-status-error/10 border-status-error/30',
                    icon: 'text-status-error',
                    title: 'text-status-error',
                    text: 'text-contrast-secondary',
                    button: 'text-status-error hover:text-status-error'
                };
            case 'warning':
                return {
                    container: 'bg-status-warning/10 border-status-warning/30',
                    icon: 'text-status-warning',
                    title: 'text-status-warning',
                    text: 'text-contrast-secondary',
                    button: 'text-status-warning hover:text-status-warning'
                };
            case 'primary':
                return {
                    container: 'bg-brand-soft/30 border-brand-primary/30',
                    icon: 'text-brand-primary',
                    title: 'text-brand-primary',
                    text: 'text-contrast-secondary',
                    button: 'text-brand-primary hover:text-brand-primary'
                };
            case 'success':
                return {
                    container: 'bg-status-success/10 border-status-success/30',
                    icon: 'text-status-success',
                    title: 'text-status-success',
                    text: 'text-contrast-secondary',
                    button: 'text-status-success hover:text-status-success'
                };
            default:
                return {
                    container: 'bg-neutral-bg border-neutral-border',
                    icon: 'text-contrast-light',
                    title: 'text-contrast-secondary',
                    text: 'text-contrast-secondary',
                    button: 'text-contrast-light hover:text-contrast-secondary'
                };
        }
    };

    const colors = getColorClasses();

    return (
        <div className={`${colors.container} border rounded-lg p-4 mb-6`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${colors.icon}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${colors.title}`}>
                        🔒 Privacy Level: {privacyLevel.level}
                    </h3>
                    <div className={`mt-2 text-sm ${colors.text}`}>
                        <p>{privacyLevel.description}</p>
                        {isExpanded && (
                            <div className="mt-2 space-y-1">
                                {userRole === 'admin' || userRole === 'municipal' ? (
                                    <>
                                        <p>• <strong>Full Access:</strong> All personal details, exact locations, internal comments</p>
                                        <p>• <strong>Staff Information:</strong> Assigned staff, department heads, escalation details</p>
                                        <p>• <strong>Internal Data:</strong> Penalty points, resolution times, escalation history</p>
                                    </>
                                ) : userRole === 'department' ? (
                                    <>
                                        <p>• <strong>Department Issues:</strong> Issues assigned to your department</p>
                                        <p>• <strong>Limited Personal Data:</strong> Reporter names but anonymized contact info</p>
                                        <p>• <strong>No Internal Data:</strong> Cannot see escalation history or penalty points</p>
                                    </>
                                ) : userRole === 'citizen' ? (
                                    <>
                                        <p>• <strong>Your Issues Only:</strong> Can see full details of your own reports</p>
                                        <p>• <strong>Anonymized Others:</strong> Other users' details are hidden</p>
                                        <p>• <strong>No Staff Info:</strong> Cannot see assigned staff or internal details</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• <strong>Public Information:</strong> Only general issue information</p>
                                        <p>• <strong>Anonymized Data:</strong> All personal details are hidden</p>
                                        <p>• <strong>No Location Details:</strong> Exact addresses and coordinates hidden</p>
                                    </>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`mt-2 text-xs font-medium ${colors.button}`}
                        >
                            {isExpanded ? 'Show less' : 'Show details'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
