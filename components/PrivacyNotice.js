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
                    color: 'red',
                    description: 'Can see all personal details, locations, and internal data'
                };
            case 'department':
                return {
                    level: 'Department Access',
                    color: 'orange',
                    description: 'Can see department-related issues with limited personal details'
                };
            case 'citizen':
                return {
                    level: 'Personal Access',
                    color: 'blue',
                    description: 'Can only see your own issues with full details'
                };
            default:
                return {
                    level: 'Public Access',
                    color: 'green',
                    description: 'Can only see anonymized public information'
                };
        }
    };

    const privacyLevel = getPrivacyLevel();

    if (!showDetails) return null;

    const getColorClasses = () => {
        switch (privacyLevel.color) {
            case 'red':
                return {
                    container: 'bg-red-50 border-red-200',
                    icon: 'text-red-500',
                    title: 'text-red-800',
                    text: 'text-red-700',
                    button: 'text-red-600 hover:text-red-800'
                };
            case 'orange':
                return {
                    container: 'bg-orange-50 border-orange-200',
                    icon: 'text-orange-500',
                    title: 'text-orange-800',
                    text: 'text-orange-700',
                    button: 'text-orange-600 hover:text-orange-800'
                };
            case 'blue':
                return {
                    container: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-500',
                    title: 'text-blue-800',
                    text: 'text-blue-700',
                    button: 'text-blue-600 hover:text-blue-800'
                };
            case 'green':
                return {
                    container: 'bg-green-50 border-green-200',
                    icon: 'text-green-500',
                    title: 'text-green-800',
                    text: 'text-green-700',
                    button: 'text-green-600 hover:text-green-800'
                };
            default:
                return {
                    container: 'bg-gray-50 border-gray-200',
                    icon: 'text-gray-500',
                    title: 'text-gray-800',
                    text: 'text-gray-700',
                    button: 'text-gray-600 hover:text-gray-800'
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
