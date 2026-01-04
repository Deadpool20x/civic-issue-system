"use client";

import React from "react";

/**
 * StatCard component - Unified stat card for all dashboards with premium colors
 * Design System: white, rounded-2xl, border-slate-200, shadow-sm
 */
const StatCard = ({
    label,
    value,
    accent = "border-l-4 border-l-brand-primary",
    iconBg = "bg-brand-soft",
    iconColor = "text-brand-primary",
    iconPath = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    className = ""
}) => {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative hover:shadow-md transition-shadow duration-200 ${accent} ${className}`}
        >
            <div className="flex items-center">
                <div className={`rounded-xl p-3 ${iconBg}`}>
                    <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-contrast-secondary">{label}</p>
                    <p className="text-2xl font-bold text-contrast-primary">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;