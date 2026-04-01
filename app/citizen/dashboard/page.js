'use client'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/useStaticTranslation';
import FeedbackModal from '@/components/FeedbackModal';
import toast from 'react-hot-toast';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import IssueCard from '@/components/IssueCard';
import EmptyState from '@/components/EmptyState';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';

const NearbyIssuesMap = dynamic(() => import('@/components/NearbyIssuesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 animate-pulse bg-white/5 border border-white/10 rounded-[20px] flex items-center justify-center">
      <p className="text-[#AAAAAA] text-sm font-medium uppercase tracking-widest opacity-50">Loading Map...</p>
    </div>
  )
});

export default function CitizenDashboard() {
  const { user, loading, refreshUser } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [reopenModal, setReopenModal] = useState({ isOpen: false, issueId: null });
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0, overdue: 0, slaHealth: 0 });

  // Define fetchIssues BEFORE the useEffect that calls it
  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        const issuesList = data.issues || data.data || [];
        setIssues(issuesList);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setIssuesLoading(false);
    }
  };


  // Fetch issues and location on mount (only if user is authenticated)
  useEffect(() => {
    if (!loading && user && (user.role?.toUpperCase() === 'CITIZEN' || user.role === 'citizen')) {
      fetchIssues();

      // Fetch stats from API
      fetch('/api/issues/stats')
        .then(r => r.json())
        .then(data => {
          if (data.success) setStats(data.data)
        })
        .catch(err => console.error('Stats error:', err))

      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
          () => { }, // Silently handle geolocation errors
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [loading, user]);

  // RENDER DASHBOARD HERE
  const handleAction = async (issueId, action, reason = '') => {
    try {
      const res = await fetch(`/api/issues/${issueId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'confirm' ? t('citizen.closeSuccess') : t('citizen.reopenSuccess'));
        fetchIssues();
        setReopenModal({ isOpen: false, issueId: null });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'assigned', 'in-progress', 'reopened'].includes(issue.status);
    if (filter === 'resolved') return issue.status === 'resolved';
    return true;
  });

  return (
    <DashboardProtection allowedRoles={['CITIZEN', 'citizen']}>
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          <PageHeader
            title={t('citizen.dashboard')}
            subtitle={t('citizen.dashboardSubtitle', { name: user?.name?.split(' ')[0], count: stats.pending, defaultValue: `Welcome back, ${user?.name?.split(' ')[0]}. You have ${stats.pending} active issues.` })}
          >
            <Link href="/citizen/report" className="btn-gold flex items-center gap-2">
              <span className="text-xl">➕</span> {t('citizen.reportIssue')}
            </Link>
          </PageHeader>

          {/* ── STATS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {issuesLoading ? (
              <>
                <div className="h-32 animate-pulse bg-white/5 border border-white/10 rounded-2xl" />
                <div className="h-32 animate-pulse bg-white/5 border border-white/10 rounded-2xl" />
                <div className="h-32 animate-pulse bg-white/5 border border-white/10 rounded-2xl" />
              </>
            ) : (
              <>
                <StatCard label={t('citizen.totalReports')} value={stats.total} icon="📄" />
                <StatCard label={t('citizen.pending')} value={stats.pending} icon="⏰" />
                <StatCard label={t('citizen.resolved')} value={stats.resolved} icon="✅" />
              </>
            )}
          </div>

          {/* ── NEARBY MAP ── */}
          {(userLoc || issuesLoading) && (
            <div className="animate-fade-in shadow-2xl rounded-3xl overflow-hidden border border-border">
              <NearbyIssuesMap center={userLoc || [22.7196, 75.8577]} />
            </div>
          )}

          {/* ── FILTERS ── */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`pill ${filter === 'all' ? 'pill-active' : 'pill-inactive'} font-bold transition-all`}
            >
              {t('common.search')}
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`pill ${filter === 'pending' ? 'pill-active' : 'pill-inactive'} font-bold transition-all`}
            >
              {t('citizen.inProgress')}
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`pill ${filter === 'resolved' ? 'pill-active' : 'pill-inactive'} font-bold transition-all`}
            >
              {t('citizen.resolved')}
            </button>
          </div>

          {/* ── ISSUE GRID ── */}
          {issuesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card h-64 animate-pulse bg-white/10 border-white/20" />
              ))}
            </div>
          ) : filteredIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map(issue => (
                <div key={issue._id} className="flex flex-col gap-2 group">
                  <IssueCard issue={issue} />
                  {issue.status === 'resolved' && issue.citizenConfirmed === null && (
                    <div className="flex gap-2 p-1">
                      <button
                        onClick={() => handleAction(issue._id, 'confirm')}
                        className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-xl border border-green-500/20 transition-all"
                      >
                        ✅ {t('citizen.confirmFixed')}
                      </button>
                      <button
                        onClick={() => setReopenModal({ isOpen: true, issueId: issue._id })}
                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-all"
                      >
                        🔄 {t('citizen.requestReopen')}
                      </button>
                    </div>
                  )}
                  {issue.citizenConfirmed === true && (
                    <div className="p-2 text-center text-[10px] font-bold text-green-400/60 uppercase tracking-widest border border-green-500/10 rounded-xl bg-green-500/5">
                      {t('citizen.verifiedFixed')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📋"
              title={t('common.noData')}
              description={
                filter === 'all'
                  ? t('citizen.noIssuesDesc', "You haven't reported any issues yet. Help improve the city by reporting your first issue.")
                  : t('citizen.noIssuesFilteredDesc', { status: t(`citizen.${filter}`) })
              }
              action={filter === 'all' && (
                <Link href="/citizen/report" className="btn-gold px-8">{t('citizen.reportIssue')}</Link>
              )}
            />
          )}

          <FeedbackModal
            isOpen={reopenModal.isOpen}
            onClose={() => setReopenModal({ isOpen: false, issueId: null })}
            onSubmit={(reason) => handleAction(reopenModal.issueId, 'reopen', reason)}
            title={t('citizen.requestReopen')}
            placeholder={t('citizen.reopenPlaceholder')}
          />
        </div>
      </DashboardLayout>
    </DashboardProtection>
  );
}
