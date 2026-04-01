'use client'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* ============================================================
   PAGE F1: SYSTEM ADMIN DASHBOARD
   Route:     /admin/dashboard
   Access:    SYSTEM_ADMIN / admin only
   Spec:      SYSTEM_FEATURES_MASTER.md Section F1

   Feature Tree:
     Admin Dashboard
     ├── Stat Cards (4): Total Issues, Users, Resolution Rate, Avg Rating
     ├── Filter Bar: Status + Priority
     ├── Department Performance Bars
     ├── Issues Table with Quick Actions (Acknowledge, Assign, Reject)
     └── Citizen Satisfaction Section
   ============================================================ */

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'submitted': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'acknowledged': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'assigned': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'in-progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'resolved': 'bg-green-500/20 text-green-400 border border-green-500/40',
    'rejected': 'bg-red-500/20 text-red-400 border border-red-500/40',
};
const PRIORITY_STYLES = {
    'urgent': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    'low': 'bg-green-500/20 text-green-400 border border-green-500/40',
};

export default function AdminDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()


  // RENDER DASHBOARD HERE
  function AdminDashboardContent() {
    const [issues, setIssues] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [stats, setStats] = useState({
      totalIssues: 0,
      totalUsers: 0,
      resolutionRate: 0,
    })

    const inputCls = "bg-input border border-border rounded-input text-white px-4 py-2.5 focus:border-gold focus:outline-none text-sm";

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
      try {
        setLoadingState(true)

        // Fetch all issues (admin reads all — no filter)
        const [issuesRes, statsRes, userStatsRes] = await Promise.all([
          fetch('/api/issues'),
          fetch('/api/issues/stats'),
          fetch('/api/admin/users/stats')
        ])

        if (issuesRes.ok) {
          const issuesJson = await issuesRes.json()
          setIssues(Array.isArray(issuesJson.data)
            ? issuesJson.data : [])
        }

        if (statsRes.ok) {
          const statsJson = await statsRes.json()
          if (statsJson.success) {
            setStats(prev => ({
              ...prev,
              totalIssues: statsJson.data.total || 0,
              resolutionRate: statsJson.data.slaHealth || 0,
            }))
          }
        }

        if (userStatsRes.ok) {
          const userStatsJson = await userStatsRes.json()
          if (userStatsJson.success) {
            setStats(prev => ({
              ...prev,
              totalUsers: userStatsJson.data.total || 0,
            }))
          }
        }

      } catch (error) {
        toast.error('Failed to load dashboard data')
        console.error('Admin dashboard fetch error:', error)
        setIssues([])
      } finally {
        setLoadingState(false)
      }
    }

    const filteredIssues = issues.filter(i => (filterStatus === 'all' || i.status === filterStatus) && (filterPriority === 'all' || i.priority === filterPriority));

    const statCards = [
      { label: 'Total Issues',    value: stats.totalIssues,     icon: '📊' },
      { label: 'Total Users',     value: stats.totalUsers,      icon: '👥' },
      { label: 'SLA Health',      value: `${stats.resolutionRate}%`, icon: '✅' },
      { label: 'Active Officers', value: 16,                    icon: '👷' },
    ]

    if (loadingState) return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-white/10 rounded-xl" />
              <div className="h-4 w-48 bg-white/5 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-[20px]" />
            ))}
          </div>
          <div className="h-64 bg-white/5 border border-white/10 rounded-card" />
        </div>
      </DashboardLayout>
    );

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-text-secondary text-sm mt-1">System-wide issue management</p>
            </div>
            <div className="flex gap-3">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
                <option value="all">All ({issues.length})</option>
                <option value="submitted">Submitted</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={inputCls}>
                <option value="all">All Priorities</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <span className="text-xl mb-2 block">{s.icon}</span>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Read Only Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30
                          rounded-[12px] px-4 py-3 flex items-center gap-2">
            <span className="text-amber-400">👁️</span>
            <p className="text-amber-400 text-sm">
              System Admin — Issue data is read-only.
              Use User Management to manage staff accounts.
            </p>
          </div>

          {/* Issues Table */}
          <div className="bg-card rounded-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="section-header mb-0">Issues Management</h2>
              <span className="text-xs text-text-muted">{filteredIssues.length} issues</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table-dark w-full">
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredIssues.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-text-secondary">No issues found</td></tr>
                  ) : filteredIssues.map(issue => (
                    <tr key={issue._id}>
                      <td><Link href={`/issues/${issue.reportId || issue._id}`} className="report-id hover:underline">{issue.reportId}</Link></td>
                      <td>
                        <div className="text-white text-sm max-w-[180px] truncate">{issue.title}</div>
                        <div className="text-text-muted text-xs truncate max-w-[180px]">{issue.location?.address?.substring(0, 40)}</div>
                      </td>
                      <td className="text-text-secondary text-xs capitalize">{issue.category}</td>
                      <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>{issue.status}</span></td>
                      <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || ''}`}>{issue.priority}</span></td>
                      <td>
                        <Link
                          href={`/admin/issues/${issue._id}`}
                          className="text-xs text-[#F5A623] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
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

  return (
    <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
      <AdminDashboardContent />
    </DashboardProtection>
  );
}
