'use client'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import { DEPARTMENTS, getDepartmentWards, WARD_MAP } from '@/lib/wards';

export default function DepartmentDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()


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
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/30',
        text: 'text-teal-400',
        bar: 'bg-teal-500',
        badge: 'bg-teal-500/20 text-purple-300 border-teal-500/30'
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
        <div className="space-y-8 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-white/10 rounded-xl" />
            <div className="h-4 w-96 bg-white/5 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white/5 border border-white/10 rounded-[20px]" />
            <div className="h-64 bg-white/5 border border-white/10 rounded-[20px]" />
          </div>
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

    // Always show both ward cards even if no issues yet
    // Use empty stat object as fallback when no data
    const emptystat = {
      total: 0, active: 0, resolved: 0,
      overdue: 0, slaHealth: 0, officer: null
    }

    if (northWard) {
      wardCards.push({
        ward: northWard,
        stat: northWardStat || emptystat,
        zone: 'north'
      });
    }

    if (southWard) {
      wardCards.push({
        ward: southWard,
        stat: southWardStat || emptystat,
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

          {/* ── CRITICAL FEEDBACK LOOP ── */}
          <CriticalFeedbackLoop
            departmentId={departmentId}
            northWardId={northWardId}
            southWardId={southWardId}
          />
        </div>
      </DashboardLayout>
    );
  }

function CriticalFeedbackLoop({ departmentId, northWardId, southWardId }) {
  const [overdueIssues, setOverdueIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [reassigning, setReassigning] = useState(null)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [officers, setOfficers] = useState({ north: null, south: null })

  useEffect(() => {
    fetchOverdueIssues()
    fetchOfficers()
  }, [departmentId])

  async function fetchOverdueIssues() {
    try {
      setLoading(true)
      const res = await fetch('/api/issues?overdue=true')
      const data = await res.json()
      if (data.success) {
        const overdue = (data.data || []).filter(
          i => i.sla?.isOverdue && i.status !== 'resolved'
        )
        setOverdueIssues(overdue)
      }
    } catch (err) {
      console.error('Failed to fetch overdue issues:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOfficers() {
    try {
      const [northRes, southRes] = await Promise.all([
        fetch(`/api/admin/users?role=FIELD_OFFICER&wardId=${northWardId}`),
        fetch(`/api/admin/users?role=FIELD_OFFICER&wardId=${southWardId}`)
      ])
      const [northData, southData] = await Promise.all([
        northRes.json(),
        southRes.json()
      ])
      setOfficers({
        north: northData.data?.[0] || null,
        south: southData.data?.[0] || null
      })
    } catch (err) {
      console.error('Failed to fetch officers:', err)
    }
  }

  async function handleReassign(issueId, newOfficerId) {
    try {
      setReassigning(issueId)
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: newOfficerId })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to reassign')
        return
      }
      toast.success('Issue reassigned successfully')
      setShowReassignModal(false)
      setSelectedIssue(null)
      fetchOverdueIssues()
    } catch {
      toast.error('Failed to reassign issue')
    } finally {
      setReassigning(null)
    }
  }

  const getDaysOverdue = (deadline) => {
    if (!deadline) return 0
    const diff = new Date() - new Date(deadline)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">
            Critical Feedback Loop
          </h3>
          <p className="text-[#AAAAAA] text-sm mt-0.5">
            Overdue issues requiring immediate attention
          </p>
        </div>
        {overdueIssues.length > 0 && (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30
                           px-3 py-1 rounded-full text-sm font-bold">
            {overdueIssues.length} overdue
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : overdueIssues.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-green-400 font-medium">
            All issues are within SLA deadline
          </p>
          <p className="text-[#AAAAAA] text-sm mt-1">
            No overdue issues right now
          </p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 px-4 py-2 mb-2">
            <span className="text-[#666666] text-xs uppercase tracking-wider col-span-2">
              Issue
            </span>
            <span className="text-[#666666] text-xs uppercase tracking-wider">
              Ward
            </span>
            <span className="text-[#666666] text-xs uppercase tracking-wider">
              Overdue
            </span>
            <span className="text-[#666666] text-xs uppercase tracking-wider">
              Action
            </span>
          </div>

          {/* Table rows */}
          <div className="space-y-2">
            {overdueIssues.map(issue => (
              <div
                key={issue._id}
                className="grid grid-cols-5 gap-4 px-4 py-3
                           bg-red-500/5 border border-red-500/20
                           rounded-xl items-center"
              >
                <div className="col-span-2">
                  <span className="text-xs font-mono text-[#F5A623]
                                   bg-[#F5A623]/10 px-2 py-0.5 rounded mr-2">
                    {issue.reportId}
                  </span>
                  <p className="text-white text-sm mt-1 truncate">
                    {issue.title}
                  </p>
                </div>
                <div>
                  <span className="text-[#AAAAAA] text-sm">
                    Ward {WARD_MAP[issue.ward]?.wardNumber || '?'}
                  </span>
                </div>
                <div>
                  <span className="text-red-400 text-sm font-medium">
                    {getDaysOverdue(issue.sla?.deadline)}d overdue
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setSelectedIssue(issue)
                      setShowReassignModal(true)
                    }}
                    className="text-xs bg-[#F5A623] text-black font-bold
                               px-3 py-1.5 rounded-full hover:bg-[#E09010]
                               transition"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reassign Modal */}
      {showReassignModal && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-[#333333]
                          rounded-[20px] p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-2">
              Reassign Issue
            </h3>
            <p className="text-[#AAAAAA] text-sm mb-6">
              {selectedIssue.reportId} — {selectedIssue.title}
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-[#AAAAAA] text-xs uppercase tracking-wider">
                Select Officer to Reassign To:
              </p>

              {/* North Zone Officer */}
              <button
                onClick={() => officers.north &&
                  handleReassign(selectedIssue._id, officers.north._id)}
                disabled={!officers.north || reassigning === selectedIssue._id}
                className={`w-full p-4 rounded-xl border text-left transition
                  ${officers.north
                    ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                    : 'bg-[#222] border-[#333] opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-xs font-bold uppercase mb-1">
                      North Zone
                    </p>
                    <p className="text-white font-medium">
                      {officers.north?.name || 'No officer assigned'}
                    </p>
                    <p className="text-[#AAAAAA] text-xs">
                      Ward {WARD_MAP[northWardId]?.wardNumber}
                    </p>
                  </div>
                  {selectedIssue.ward === northWardId && (
                    <span className="text-xs text-[#AAAAAA] bg-[#333]
                                     px-2 py-1 rounded">Current</span>
                  )}
                </div>
              </button>

              {/* South Zone Officer */}
              <button
                onClick={() => officers.south &&
                  handleReassign(selectedIssue._id, officers.south._id)}
                disabled={!officers.south || reassigning === selectedIssue._id}
                className={`w-full p-4 rounded-xl border text-left transition
                  ${officers.south
                    ? 'bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20'
                    : 'bg-[#222] border-[#333] opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-400 text-xs font-bold uppercase mb-1">
                      South Zone
                    </p>
                    <p className="text-white font-medium">
                      {officers.south?.name || 'No officer assigned'}
                    </p>
                    <p className="text-[#AAAAAA] text-xs">
                      Ward {WARD_MAP[southWardId]?.wardNumber}
                    </p>
                  </div>
                  {selectedIssue.ward === southWardId && (
                    <span className="text-xs text-[#AAAAAA] bg-[#333]
                                     px-2 py-1 rounded">Current</span>
                  )}
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowReassignModal(false)
                setSelectedIssue(null)
              }}
              className="w-full py-3 rounded-full border border-[#333]
                         text-[#AAAAAA] hover:border-white hover:text-white
                         transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

  return (
    <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER']}>
      <DepartmentDashboardContent />
    </DashboardProtection>
  );
}
