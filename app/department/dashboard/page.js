'use client'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { DEPARTMENTS, getDepartmentWards, WARD_MAP } from '@/lib/wards';

export default function DepartmentDashboard() {
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
  const roleUpper = user.role?.toUpperCase();
  if (roleUpper !== 'DEPARTMENT_MANAGER') {
    router.push('/login')
    return null
  }

  // RENDER DASHBOARD HERE
  function DepartmentDashboardContent() {
    const [wardStats, setWardStats] = useState([]);
    const [loadingState, setLoadingState] = useState(true);

    // Get department from JWT
    const departmentId = user?.departmentId;
    const dept = departmentId ? DEPARTMENTS[departmentId] : null;

    // Get wards for department
    const deptWards = departmentId ? getDepartmentWards(departmentId) : [];
    const northWardId = deptWards[0];
    const southWardId = deptWards[1];
    const northWard = northWardId ? WARD_MAP[northWardId] : null;
    const southWard = southWardId ? WARD_MAP[southWardId] : null;

    const fetchData = useCallback(async () => {
      if (!departmentId || !dept) {
        setLoadingState(false);
        return;
      }

      try {
        setLoadingState(true);
        const res = await fetch('/api/issues/ward-stats');
        const json = await res.json();

        if (json.success) {
          setWardStats(json.data || []);
        } else {
          if (json.error) {
            toast.error(json.error);
          } else {
            toast.error('Failed to load ward stats');
          }
          setWardStats([]);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        toast.error('Failed to load dashboard data');
        setWardStats([]);
      } finally {
        setLoadingState(false);
      }
    }, [departmentId, dept]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Zone color helper
    const getZoneColorClass = (zone) => {
      if (zone === 'north') return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        bar: 'bg-blue-500',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
      if (zone === 'south') return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        bar: 'bg-purple-500',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      };
      return {
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        bar: 'bg-gray-500',
        badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      };
    };

    // Calculate overall stats from ward stats
    const overallStats = useMemo(() => {
      if (!wardStats.length) return { total: 0, active: 0, resolved: 0, overdue: 0, slaHealth: 0 };

      const total = wardStats.reduce((sum, w) => sum + (w.total || 0), 0);
      const active = wardStats.reduce((sum, w) => sum + (w.active || 0), 0);
      const resolved = wardStats.reduce((sum, w) => sum + (w.resolved || 0), 0);
      const overdue = wardStats.reduce((sum, w) => sum + (w.overdue || 0), 0);
      const slaHealth = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;

      return { total, active, resolved, overdue, slaHealth };
    }, [wardStats]);

    // Get specific ward stat by wardId
    const getWardStat = (wardId) => {
      return wardStats.find(w => w.wardId === wardId) || null;
    };

    if (loadingState) return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );

    // Handle Missing Department
    if (!departmentId || !dept) {
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-[#1A1A1A] border border-red-500/30 rounded-[20px] p-8 max-w-md text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-white font-bold text-xl mb-2">Department Not Assigned</h2>
              <p className="text-[#AAAAAA] text-sm leading-relaxed">
                Your account does not have a department assigned.
                Please contact the System Admin at admin@civicpulse.in to fix this.
              </p>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    // Get ward stats for north and south
    const northWardStat = northWardId ? getWardStat(northWardId) : null;
    const southWardStat = southWardId ? getWardStat(southWardId) : null;

    // Create exactly 2 ward cards (north and south)
    const wardCards = [];

    if (northWard && northWardStat) {
      wardCards.push({
        ward: northWard,
        stat: northWardStat,
        zone: 'north'
      });
    }

    if (southWard && southWardStat) {
      wardCards.push({
        ward: southWard,
        stat: southWardStat,
        zone: 'south'
      });
    }

    return (
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {dept.icon} {dept.name} — Department Hub
            </h1>
            <p className="text-[#AAAAAA] mt-1">
              Managing {dept.name} operations across
              North Zone (Ward {northWard?.wardNumber || '?'}) and
              South Zone (Ward {southWard?.wardNumber || '?'})
            </p>
          </div>

          {/* ── OVERALL STATS ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-3xl font-bold text-white">{overallStats.total}</div>
              <div className="text-[#AAAAAA] text-sm">Total Issues</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-3xl font-bold text-blue-400">{overallStats.active}</div>
              <div className="text-[#AAAAAA] text-sm">Active</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-3xl font-bold text-green-400">{overallStats.resolved}</div>
              <div className="text-[#AAAAAA] text-sm">Resolved</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] p-5">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-3xl font-bold text-gold">{overallStats.slaHealth}%</div>
              <div className="text-[#AAAAAA] text-sm">
                {overallStats.overdue > 0 ? `${overallStats.overdue} overdue` : 'All on track'}
              </div>
            </div>
          </div>

          {/* ── EXACTLY 2 WARD CARDS ── */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Zone Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wardCards.map(({ ward, stat, zone }) => {
                const colors = getZoneColorClass(zone);
                const officerName = stat.officer?.name || 'Vacant';
                const isVacant = !stat.officer;

                return (
                  <div
                    key={ward.wardId}
                    className={`bg-[#1A1A1A] border-2 ${colors.border} rounded-[20px] relative overflow-hidden`}
                  >
                    {/* Zone indicator bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar}`}></div>

                    <div className="p-5">
                      {/* Ward header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-2xl font-bold ${colors.text}`}>
                              Ward {ward.wardNumber}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge}`}>
                              {zone === 'north' ? 'North' : 'South'}
                            </span>
                          </div>
                          <div className="text-[#AAAAAA] text-sm">
                            {dept.name}
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                          <span className={colors.text}>🏢</span>
                        </div>
                      </div>

                      {/* Field Officer */}
                      <div className={`mb-4 p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                        <div className="text-xs text-[#AAAAAA] uppercase tracking-tight mb-1">
                          Field Officer
                        </div>
                        <div className={`font-medium ${isVacant ? 'text-amber-400' : 'text-white'}`}>
                          {officerName}
                          {isVacant && <span className="text-xs ml-2 text-amber-400/70">(Unassigned)</span>}
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-[#252525] rounded-lg">
                          <div className="text-lg font-bold text-white">{stat.active || 0}</div>
                          <div className="text-[10px] text-[#AAAAAA] uppercase">Active</div>
                        </div>
                        <div className="text-center p-2 bg-[#252525] rounded-lg">
                          <div className="text-lg font-bold text-green-400">{stat.resolved || 0}</div>
                          <div className="text-[10px] text-[#AAAAAA] uppercase">Resolved</div>
                        </div>
                        <div className="text-center p-2 bg-[#252525] rounded-lg">
                          <div className={`text-lg font-bold ${stat.overdue > 0 ? 'text-red-400' : 'text-white'}`}>
                            {stat.overdue || 0}
                          </div>
                          <div className="text-[10px] text-[#AAAAAA] uppercase">Overdue</div>
                        </div>
                      </div>

                      {/* SLA Health Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#AAAAAA]">SLA Health</span>
                          <span className={`font-bold ${stat.slaHealth >= 80 ? 'text-green-400' :
                              stat.slaHealth >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                            {stat.slaHealth || 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colors.bar} ${stat.slaHealth >= 80 ? '' :
                                stat.slaHealth >= 50 ? 'opacity-70' : 'opacity-50'
                              }`}
                            style={{ width: `${stat.slaHealth || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* View Issues Button */}
                      <Link
                        href={`/department/issues?ward=${ward.wardId}`}
                        className={`block w-full text-center py-2.5 rounded-lg font-medium text-sm transition-all ${colors.bg + ' ' + colors.text + ' hover:' + colors.bar + ' hover:text-white'
                            }`}
                      >
                        View Issues →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty state if no ward data */}
          {wardCards.length === 0 && !loadingState && (
            <div className="bg-[#1A1A1A] border border-gold/20 rounded-[20px] text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-white mb-2">No Ward Data Available</h3>
              <p className="text-[#AAAAAA] text-sm">
                There are no wards assigned to your department yet.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DepartmentDashboardContent />
  );
}
