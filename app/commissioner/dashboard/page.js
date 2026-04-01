'use client'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import Link from 'next/link';
import { DEPARTMENTS } from '@/lib/wards';

export default function CommissionerDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()


  // RENDER DASHBOARD HERE
  function CommissionerDashboardContent() {
    const [briefing, setBriefing] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [wardStats, setWardStats] = useState([]);
    const [escalations, setEscalations] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const [staffCounts, setStaffCounts] = useState({ officers: 0, managers: 0 });

    const fetchDashboardData = useCallback(async () => {
      try {
        setLoadingState(true);
        const [briefRes, statsRes, wardStatsRes, issuesRes, staffRes] = await Promise.all([
          fetch('/api/commissioner/briefing'),
          fetch('/api/issues/stats'),
          fetch('/api/issues/ward-stats'),
          fetch('/api/issues?priority=urgent&limit=10'),
          fetch('/api/admin/users/stats')
        ]);

        console.log('[DEBUG CommissionerDashboard] API responses:', {
          brief: briefRes.status,
          stats: statsRes.status,
          wardStats: wardStatsRes.status,
          issues: issuesRes.status
        });

        const [briefJson, statsJson, wardStatsJson, issuesJson, staffJson] = await Promise.all([
          briefRes.json(),
          statsRes.json(),
          wardStatsRes.json(),
          issuesRes.json(),
          staffRes.json()
        ]);

        if (briefJson.success) { setBriefing(briefJson.briefing); }
        if (statsJson.success) { setStatsData(statsJson.data); }
        if (wardStatsJson.success) { setWardStats(wardStatsJson.data || []); }
        if (issuesJson.success) { setEscalations(issuesJson.data || []); }
        if (staffJson.success) {
          setStaffCounts({
            officers: staffJson.data.officers || 0,
            managers: staffJson.data.managers || 0
          });
        }

      } catch (err) {
        console.error('[DEBUG CommissionerDashboard] Error loading dashboard:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingState(false);
      }
    }, []);

    useEffect(() => {
      fetchDashboardData();
    }, [fetchDashboardData]);

    if (loadingState) return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
          <div className="h-12 w-3/4 bg-white/10 rounded-xl" />
          <div className="h-64 bg-white/5 border border-white/10 rounded-card" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );

    // Group ward stats by department
    const departmentGroups = Object.keys(DEPARTMENTS).map(deptId => {
      const dept = DEPARTMENTS[deptId];
      const deptWards = wardStats.filter(w => w.departmentId === deptId);

      // Find North and South zone wards
      const northWard = deptWards.find(w => w.zone === 'north');
      const southWard = deptWards.find(w => w.zone === 'south');

      // Calculate totals
      const total = (northWard?.total || 0) + (southWard?.total || 0);
      const resolved = (northWard?.resolved || 0) + (southWard?.resolved || 0);
      const active = (northWard?.active || 0) + (southWard?.active || 0);
      const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      // Calculate average SLA health
      const slaHealthValues = [northWard?.slaHealth, southWard?.slaHealth].filter(v => v !== null && v !== undefined);
      const avgSlaHealth = slaHealthValues.length > 0
          ? Math.round(slaHealthValues.reduce((a, b) => a + b, 0) / slaHealthValues.length)
          : 0;

      return {
        id: deptId,
        ...dept,
        north: northWard,
        south: southWard,
        total,
        resolved,
        active,
        resolvedRate,
        avgSlaHealth
      };
    });

    // Calculate city-wide stats
    const totalCityIssues = statsData?.total || 0;
    const resolvedToday = statsData?.resolved || 0; // Using total resolved as proxy
    const criticalEscalations = escalations.filter(i => i.priority === 'urgent').length;
    const citySlaHealth = statsData?.slaHealth || 0;

    return (
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          <PageHeader
            title="Municipal Commissioner — City Operations Center"
            subtitle="Anand District, Gujarat"
          >
            <button className="btn-gold text-xs">Generate Report</button>
          </PageHeader>

          {/* ── AI BRIEFING CARD ── */}
          {briefing && (
            <div className="card border-gold/40 bg-gradient-to-br from-card to-gold/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">🤖</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-gold text-black text-[10px] font-bold rounded tracking-wider">AI Insight</span>
                  <span className="text-text-secondary text-xs">{briefing.date}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-3">{briefing.title}</h2>
                <p className="text-text-secondary mb-6 leading-relaxed max-w-2xl">{briefing.summary}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="section-header">Key Indicators</h3>
                    {briefing.keyPoints?.map((point, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-text-primary">
                        <span className="text-gold">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="section-header">Critical Alerts</h3>
                    {briefing.criticalAlerts?.map((alert, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-red-400">
                        <span>⚠️</span>
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STATS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total City Issues"
              value={totalCityIssues}
              icon="🏙️"
            />
            <StatCard
              label="Resolved Today"
              value={resolvedToday}
              icon="✅"
            />
            <StatCard
              label="Critical Escalations"
              value={criticalEscalations}
              icon="🚨"
              trend={criticalEscalations > 5 ? 'down' : 'up'}
            />
            <StatCard
              label="City SLA Health"
              value={`${citySlaHealth}%`}
              icon="💚"
              trend={citySlaHealth > 80 ? 'up' : 'down'}
            />
          </div>

          {/* ── DEPARTMENT CARDS GRID ── */}
          <div>
            <h3 className="section-header mb-6">Department Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentGroups.map(dept => (
                <div
                  key={dept.id}
                  className="card !p-4 hover:border-gold/40 transition-all group"
                >
                  {/* Department Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{dept.icon}</span>
                    <h4 className="font-bold text-white text-sm">{dept.name}</h4>
                  </div>

                  {/* North Zone Row */}
                  <div className="flex items-center justify-between py-1.5 px-2 rounded bg-blue-500/10 border border-blue-500/20 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-xs text-blue-400 font-medium">
                        North (Ward {dept.north?.wardNumber || '-'})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-text-secondary">
                        {dept.north?.active || 0} issues
                      </span>
                      <span className={`font-bold ${(dept.north?.slaHealth || 0) > 80 ? 'text-green-400' :
                                                  (dept.north?.slaHealth || 0) > 50 ? 'text-amber-400' : 'text-red-400'
                                                }`}>
                      {dept.north?.slaHealth || 0}%
                      </span>
                    </div>
                  </div>

                  {/* South Zone Row */}
                  <div className="flex items-center justify-between py-1.5 px-2 rounded bg-teal-500/10 border border-teal-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      <span className="text-xs text-teal-400 font-medium">
                        South (Ward {dept.south?.wardNumber || '-'})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-text-secondary">
                        {dept.south?.active || 0} issues
                      </span>
                      <span className={`font-bold ${(dept.south?.slaHealth || 0) > 80 ? 'text-green-400' :
                                                  (dept.south?.slaHealth || 0) > 50 ? 'text-amber-400' : 'text-red-400'
                                                }`}>
                      {dept.south?.slaHealth || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Totals Row */}
                  <div className="border-t border-border/50 pt-3 mb-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">
                        Total: <span className="text-white font-medium">{dept.total} issues</span>
                      </span>
                      <span className={`font-bold ${dept.resolvedRate > 80 ? 'text-green-400' :
                                                  dept.resolvedRate > 50 ? 'text-amber-400' : 'text-red-400'
                                                }`}>
                      Resolved: {dept.resolvedRate}%
                      </span>
                    </div>
                  </div>

                  {/* View All Button */}
                  <Link
                    href={`/commissioner/issues?dept=${dept.id}`}
                    className="block text-center py-1.5 text-xs text-gold hover:text-white border border-gold/30 hover:border-gold rounded transition-colors"
                  >
                    View All →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN CONTENT GRID ── */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Escalations */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="section-header mb-6">Critical Escalations</h3>
                {escalations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table-dark">
                      <thead>
                        <tr>
                          <th>Issue</th>
                          <th>Ward</th>
                          <th>Department</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {escalations.slice(0, 5).map(issue => (
                          <tr key={issue._id}>
                            <td className="font-medium truncate max-w-[200px]">{issue.title}</td>
                            <td className="text-xs text-text-secondary">
                              {issue.ward?.replace('ward-', 'Ward ')}
                            </td>
                            <td>
                              <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-text-muted">
                                {issue.ward ? DEPARTMENTS[issue.ward.split('-').pop()]?.name : issue.category}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${issue.status} text-[10px]`}>
                                {issue.status?.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">No critical escalations at this time.</p>
                )}
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="space-y-6">
              <div className="card border-gold/20">
                <h3 className="section-header mb-6">Staffing Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Field Officers</span>
                    <span className="text-white font-bold">
                      {staffCounts.officers} active
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Dept Managers</span>
                    <span className="text-white font-bold">
                      {staffCounts.managers} active
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <Link href="/commissioner/staff" className="btn-outline w-full text-center py-2 text-xs">View Workforce</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER']}>
      <CommissionerDashboardContent />
    </DashboardProtection>
  );
}
