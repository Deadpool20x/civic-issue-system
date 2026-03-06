'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* PAGE D3: Department Management (Dept Manager) */

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400', 'in-progress': 'bg-amber-500/20 text-amber-400',
    'resolved': 'bg-green-500/20 text-green-400', 'rejected': 'bg-red-500/20 text-red-400',
};

function DepartmentsContent() {
    const [departments, setDepartments] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [deptRes, issuesRes] = await Promise.all([
                fetch('/api/departments'), fetch('/api/issues', { credentials: 'include' })
            ]);
            if (deptRes.ok) setDepartments(await deptRes.json());
            if (issuesRes.ok) setIssues(await issuesRes.json());
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Group issues by department
    const deptTypes = ['water', 'electricity', 'roads', 'garbage', 'parks', 'other'];
    const deptStats = deptTypes.map(type => {
        const deptIssues = issues.filter(i => i.assignedDepartment === type);
        const dept = departments.find(d =>
            (type === 'water' || type === 'electricity' || type === 'roads') ? d.name === 'Public Works' :
                type === 'garbage' ? d.name === 'Environmental Services' :
                    type === 'parks' ? d.name === 'Parks and Recreation' : false
        );
        return { type, dept, issues: deptIssues, staff: dept?.staffCount || 0, count: deptIssues.length };
    });

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Department Management</h1>
                    <p className="text-text-secondary text-sm mt-1">Overview of all departments and their issues</p>
                </div>

                {/* Department Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                    {deptStats.map(d => (
                        <div key={d.type} className="bg-card rounded-card border border-border p-5 hover:border-gold/30 transition-colors">
                            <h3 className="text-white font-semibold capitalize text-lg mb-1">{d.type}</h3>
                            <p className="text-text-muted text-xs mb-4">{d.dept?.name || 'Department'}</p>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-input rounded-input p-3 text-center">
                                    <div className="text-xl font-bold text-gold">{d.staff}</div>
                                    <div className="text-xs text-text-muted uppercase tracking-widest">Staff</div>
                                </div>
                                <div className="bg-input rounded-input p-3 text-center">
                                    <div className="text-xl font-bold text-white">{d.count}</div>
                                    <div className="text-xs text-text-muted uppercase tracking-widest">Issues</div>
                                </div>
                            </div>

                            {d.issues.length > 0 && (
                                <div className="border-t border-border pt-3 space-y-1.5">
                                    <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Recent</p>
                                    {d.issues.slice(0, 3).map(issue => (
                                        <div key={issue._id} className="flex items-center justify-between text-sm">
                                            <span className="text-text-secondary truncate max-w-[60%]">{issue.title}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>{issue.status}</span>
                                        </div>
                                    ))}
                                    {d.issues.length > 3 && <p className="text-xs text-gold">+{d.issues.length - 3} more</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* All Issues Table */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="section-header mb-0">All Issues by Department</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>Title</th><th>Department</th><th>Status</th><th>Priority</th><th>Reporter</th></tr></thead>
                            <tbody>
                                {issues.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-text-secondary">No issues found</td></tr>
                                ) : issues.map(issue => (
                                    <tr key={issue._id}>
                                        <td className="text-white text-sm max-w-[200px] truncate">{issue.title}</td>
                                        <td className="capitalize text-text-secondary text-xs">{issue.assignedDepartment}</td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>{issue.status}</span></td>
                                        <td className="text-text-muted text-xs capitalize">{issue.priority}</td>
                                        <td className="text-text-muted text-xs">{issue.reportedBy?.name || 'Unknown'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function MunicipalDepartmentsPage() {
    return (
        <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER', 'municipal']}>
            <DepartmentsContent />
        </DashboardProtection>
    );
}