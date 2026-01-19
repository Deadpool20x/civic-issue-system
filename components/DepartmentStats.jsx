'use client';

import { useState, useEffect } from 'react';
import Card from './ui/Card';

export default function DepartmentStats({ issues, departmentName }) {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
        avgResolutionTime: 0,
        resolvedThisWeek: 0
    });

    useEffect(() => {
        if (!issues || issues.length === 0) return;

        // Calculate statistics
        const total = issues.length;
        const pending = issues.filter(i => i.status === 'assigned').length;
        const inProgress = issues.filter(i => i.status === 'in-progress').length;
        const resolved = issues.filter(i => i.status === 'resolved').length;
        const urgent = issues.filter(i => i.priority === 'urgent').length;
        const high = issues.filter(i => i.priority === 'high').length;
        const medium = issues.filter(i => i.priority === 'medium').length;
        const low = issues.filter(i => i.priority === 'low').length;

        // Calculate average resolution time
        const resolvedIssues = issues.filter(i => i.status === 'resolved');
        let totalResolutionTime = 0;
        resolvedIssues.forEach(issue => {
            if (issue.stateHistory && issue.stateHistory.length > 0) {
                const assignedTime = issue.stateHistory.find(h => h.toStatus === 'assigned')?.timestamp;
                const resolvedTime = issue.stateHistory.find(h => h.toStatus === 'resolved')?.timestamp;
                if (assignedTime && resolvedTime) {
                    totalResolutionTime += new Date(resolvedTime) - new Date(assignedTime);
                }
            }
        });
        const avgResolutionTime = resolvedIssues.length > 0
            ? Math.round(totalResolutionTime / resolvedIssues.length / (1000 * 60 * 60))
            : 0;

        // Calculate resolved this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const resolvedThisWeek = resolvedIssues.filter(issue => {
            const resolvedTime = issue.stateHistory?.find(h => h.toStatus === 'resolved')?.timestamp;
            return resolvedTime && new Date(resolvedTime) >= oneWeekAgo;
        }).length;

        setStats({
            total,
            pending,
            inProgress,
            resolved,
            urgent,
            high,
            medium,
            low,
            avgResolutionTime,
            resolvedThisWeek
        });
    }, [issues]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="bg-neutral-surface">
                <h3 className="text-lg font-medium text-contrast-primary">Total Issues</h3>
                <p className="mt-2 text-3xl font-semibold text-brand-primary">{stats.total}</p>
            </Card>

            <Card className="bg-status-info/10">
                <h3 className="text-lg font-medium text-contrast-primary">Pending</h3>
                <p className="mt-2 text-3xl font-semibold text-status-info">{stats.pending}</p>
            </Card>

            <Card className="bg-status-warning/10">
                <h3 className="text-lg font-medium text-contrast-primary">In Progress</h3>
                <p className="mt-2 text-3xl font-semibold text-status-warning">{stats.inProgress}</p>
            </Card>

            <Card className="bg-status-success/10">
                <h3 className="text-lg font-medium text-contrast-primary">Resolved</h3>
                <p className="mt-2 text-3xl font-semibold text-status-success">{stats.resolved}</p>
            </Card>

            <Card className="bg-status-error/10">
                <h3 className="text-lg font-medium text-contrast-primary">Urgent</h3>
                <p className="mt-2 text-3xl font-semibold text-status-error">{stats.urgent}</p>
            </Card>

            <Card className="bg-brand-soft/10">
                <h3 className="text-lg font-medium text-contrast-primary">Avg Resolution Time</h3>
                <p className="mt-2 text-3xl font-semibold text-brand-primary">
                    {stats.avgResolutionTime} {stats.avgResolutionTime === 1 ? 'hour' : 'hours'}
                </p>
            </Card>

            <Card className="bg-status-success/10">
                <h3 className="text-lg font-medium text-contrast-primary">Resolved This Week</h3>
                <p className="mt-2 text-3xl font-semibold text-status-success">{stats.resolvedThisWeek}</p>
            </Card>

            <Card className="bg-status-warning/10">
                <h3 className="text-lg font-medium text-contrast-primary">High Priority</h3>
                <p className="mt-2 text-3xl font-semibold text-status-warning">{stats.high}</p>
            </Card>

            <Card className="bg-status-info/10">
                <h3 className="text-lg font-medium text-contrast-primary">Medium Priority</h3>
                <p className="mt-2 text-3xl font-semibold text-status-info">{stats.medium}</p>
            </Card>

            <Card className="bg-status-success/10">
                <h3 className="text-lg font-medium text-contrast-primary">Low Priority</h3>
                <p className="mt-2 text-3xl font-semibold text-status-success">{stats.low}</p>
            </Card>
        </div>
    );
}