'use client'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { WARD_MAP, DEPARTMENTS, ZONES } from '@/lib/wards';

export default function FieldOfficerDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#AAAAAA] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in — useEffect will redirect
  if (!user) return null

  // Wrong role — redirect
  if (user.role !== 'FIELD_OFFICER') {
    router.push('/login')
    return null
  }

  // RENDER DASHBOARD HERE
  function FieldOfficerDashboardContent() {
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, overdue: 0, slaHealth: 0 });
    const [recentIssues, setRecentIssues] = useState([]);
    const [loadingState, setLoadingState] = useState(true);

    // Get ward from JWT
    const wardId = user?.wardId;
    const ward = wardId ? WARD_MAP[wardId] : null;
    const department = ward ? DEPARTMENTS[ward.departmentId] : null;
    const zone = ward ? ZONES[ward.zone] : null;

    const fetchData = useCallback(async () => {
      if (!wardId || !ward) {
        setLoadingState(false);
        return;
      }

      try {
        setLoadingState(true);

        // Fetch ward stats
        const statsRes = await fetch(`/api/issues/ward-stats?wardId=${wardId}`);
        const statsJson = await statsRes.json();

        if (statsJson.success && statsJson.data && statsJson.data.length > 0) {
          const wardStat = statsJson.data[0];
          setStats({
            total: wardStat.total || 0,
            active: wardStat.active || 0,
            resolved: wardStat.resolved || 0,
            overdue: wardStat.overdue || 0,
            slaHealth: wardStat.slaHealth || 0
          });
        }

        // Fetch recent issues for this ward
        const issuesRes = await fetch(`/api/issues?ward=${wardId}`);
        const issuesJson = await issuesRes.json();

        if (issuesJson.success) {
          // Get only active issues (not resolved)
          const activeIssues = (issuesJson.data || [])
              .filter(i => i.status !== 'resolved')
              .slice(0, 5); // Get latest 5
          setRecentIssues(activeIssues);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingState(false);
      }
    }, [wardId, ward]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const getZoneColor = (zoneName) => {
      if (zoneName === 'north') return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        bar: 'bg-blue-500'
      };
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        bar: 'bg-purple-500'
      };
    };

    const getStatusColor = (status) => {
      const colors = {
        'pending': 'bg-gray-500/20 text-gray-400 border-gray-500/40',
        'assigned': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        'resolved': 'bg-green-500/20 text-green-400 border-green-500/40',
      };
      return colors[status] || colors.pending;
    };

    const getPriorityColor = (priority) => {
      const colors = {
        'urgent': 'bg-red-500/20 text-red-400 border-red-500/40',
        'high': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        'low': 'bg-green-500/20 text-green-400 border-green-500/40',
      };
      return colors[priority] || colors.medium;
    };

    if (loadingState) return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );

    // Handle Missing Ward
    if (!wardId || !ward) {
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-[#1A1A1A] border border-red-500/30 rounded-[20px] p-8 max-w-md text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-white font-bold text-xl mb-2">Ward Not Assigned</h2>
              <p className="text-[#AAAAAA] text-sm leading-relaxed">
                Your account does not have a ward assigned.
                Please contact your Department Manager or System Admin.
              </p>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    const colors = getZoneColor(ward.zone);

    return (
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">
              Field Officer Dashboard
            </h1>
            <p className="text-[#AAAAAA] mt-1">
              Ward {ward.wardNumber} · {zone?.name || ward.zone} Zone · {department?.name || 'Department'}
            </p>
          </div>

          {/* Ward Info Card */}
          <div className={`bg-[#1A1A1A] border-2 ${colors.border} rounded-[20px] relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-3xl font-black ${colors.text}`}>
                      Ward {ward.wardNumber}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${colors.bg} ${colors.text} ${colors.border}`}>
                      {zone?.name || ward.zone}
                    </span>
                  </div>
                  <div className="text-[#AAAAAA] text-sm">
                    {department?.icon} {department?.name}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                  <span className="text-3xl">{department?.icon || '🏢'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-[#AAAAAA] text-sm">Total Issues</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-3xl font-bold text-blue-400">{stats.active}</div>
              <div className="text-[#AAAAAA] text-sm">Active</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-3xl font-bold text-green-400">{stats.resolved}</div>
              <div className="text-[#AAAAAA] text-sm">Resolved</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">📈</div>
              <div className={`text-3xl font-bold ${stats.slaHealth >= 80 ? 'text-green-400' : stats.slaHealth >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {stats.slaHealth}%
              </div>
              <div className="text-[#AAAAAA] text-sm">SLA Health</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/department/issues" className="bg-[#1A1A1A] border border-gold/20 hover:border-gold/50 rounded-[20px] p-6 transition-all group">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold transition-colors">My Issues</h3>
              <p className="text-[#AAAAAA] text-sm">View all assigned issues</p>
            </Link>
            <Link href="/department/resolved" className="bg-[#1A1A1A] border border-gold/20 hover:border-gold/50 rounded-[20px] p-6 transition-all group">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold transition-colors">Resolved</h3>
              <p className="text-[#AAAAAA] text-sm">View resolved issues</p>
            </Link>
            <Link href="/department/stats" className="bg-[#1A1A1A] border border-gold/20 hover:border-gold/50 rounded-[20px] p-6 transition-all group">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold transition-colors">Performance</h3>
              <p className="text-[#AAAAAA] text-sm">View your stats</p>
            </Link>
          </div>

          {/* Recent Active Issues */}
          <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Recent Active Issues</h3>
              <Link href="/department/issues" className="text-gold hover:underline text-sm font-medium">
                View All →
              </Link>
            </div>

            {recentIssues.length > 0 ? (
              <div className="space-y-3">
                {recentIssues.map((issue) => (
                  <Link
                    key={issue._id}
                    href={`/issues/${issue._id}`}
                    className="block bg-[#252525] hover:bg-[#2A2A2A] border border-border rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-gold bg-gold/10 px-2 py-1 rounded">
                            {issue.reportId}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border font-bold uppercase ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border font-bold uppercase ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </div>
                        <h4 className="text-white font-medium text-sm mb-1">{issue.title}</h4>
                        <p className="text-[#AAAAAA] text-xs">
                          {new Date(issue.createdAt).toLocaleDateString()} · {issue.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">📭</span>
                <p className="text-[#AAAAAA] text-sm">No active issues</p>
              </div>
            )}
          </div>

          {/* Performance Tip */}
          {stats.overdue > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-[20px] p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="text-amber-400 font-bold mb-1">Overdue Issues</h4>
                  <p className="text-amber-400/80 text-sm">
                    You have {stats.overdue} overdue issue{stats.overdue > 1 ? 's' : ''}.
                    Please prioritize these to improve your SLA compliance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <FieldOfficerDashboardContent />
  );
}
