'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';
import { DEPARTMENTS } from '@/lib/wards';

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
            if (issuesRes.ok) {
                const data = await issuesRes.json();
                setIssues(Array.isArray(data.data) ? data.data : []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Failed to load data');
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Group issues by department (using IDs from lib/wards.js)
    const deptTypes = ['roads', 'lighting', 'waste', 'water', 'parks', 'traffic', 'health', 'other'];
    const safeIssues = Array.isArray(issues) ? issues : [];
    const safeDepartments = Array.isArray(departments) ? departments : [];

    const deptStats = deptTypes.map(type => {
        const deptIssues = safeIssues.filter(i => {
            if (!i) return false;
            // Get department ID from wardId if available
            const wardDeptId = i.ward ? i.ward.split('-').pop() : null;
            return i.assignedDepartmentCode === type || i.category === type || wardDeptId === type;
        });

        const deptInfo = DEPARTMENTS[type] || { name: 'Other / General' };

        return {
            type,
            label: deptInfo.name,
            icon: deptInfo.icon,
            issues: deptIssues,
            count: deptIssues.length
        };
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
                        <div key={d.type} className="bg-card rounded-card border border-border p-5 hover:border-gold/30 transition-colors relative overflow-hidden group">
                            {/* Background Icon Watermark */}
                            <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                {d.icon}
                            </div>

                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xl">{d.icon}</span>
                                <h3 className="text-white font-bold text-lg">{d.label}</h3>
                            </div>
                            <p className="text-text-muted text-[10px] uppercase tracking-wider mb-4">{d.type} system</p>

                            <div className="bg-input rounded-input p-4 text-center mb-4">
                                <div className="text-2xl font-black text-gold">{d.count}</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Total Issues</div>
                            </div>

                            {d.issues.length > 0 && (
                                <div className="border-t border-white/5 pt-3 space-y-2">
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Recent Activity</p>
                                    {d.issues.slice(0, 3).map(issue => (
                                        <div key={issue._id} className="flex items-center justify-between text-xs">
                                            <span className="text-text-secondary truncate max-w-[65%]">{issue.title}</span>
                                            <span className={`rounded-full px-2 py-0.5 font-medium border border-current ${STATUS_STYLES[issue.status] || ''} opacity-80`} style={{ fontSize: '9px' }}>
                                                {issue.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                    {d.issues.length > 3 && (
                                        <p className="text-[10px] text-gold italic pt-1">
                                            + {d.issues.length - 3} more unresolved tickets
                                        </p>
                                    )}
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
                                {safeIssues.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-text-secondary">No issues found</td></tr>
                                ) : safeIssues.map(issue => (
                                    <tr key={issue?._id}>
                                        <td className="text-white text-sm max-w-[200px] truncate">{issue?.title}</td>
                                        <td className="text-text-secondary text-xs">
                                            {issue?.ward ? DEPARTMENTS[issue.ward.split('-').pop()]?.name || 'Inquiry' : 'General'}
                                        </td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold border border-current ${STATUS_STYLES[issue?.status] || ''}`}>{issue?.status}</span></td>
                                        <td className="text-text-muted text-xs">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${issue?.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                                    issue?.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                        issue?.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-green-500/10 text-green-500'
                                                }`}>
                                                {issue?.priority?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-text-muted text-xs">{issue?.reportedBy?.name || 'Unknown'}</td>
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
        <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'commissioner']}>
            <DepartmentsContent />
        </DashboardProtection>
    );
}
