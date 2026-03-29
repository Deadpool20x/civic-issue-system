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

const NearbyIssuesMap = dynamic(() => import('@/components/NearbyIssuesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-[#1A1A1A] rounded-[20px] border border-[#333333] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-[#AAAAAA] text-sm">Loading map...</p>
      </div>
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
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router]);

  // Fetch issues and location on mount (only if user is authenticated)
  useEffect(() => {
    if (!loading && user && user.role?.toUpperCase() === 'CITIZEN') {
      fetchIssues();

      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
          () => { }, // Silently handle geolocation errors
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [loading, user]);

  // Show nothing while checking auth or redirecting
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#AAAAAA] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — useEffect will redirect
  if (!user) return null;

  if (user.role !== 'CITIZEN') {
    router.push('/login')
    return null
  }

  // RENDER DASHBOARD HERE
  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        // Handle both response formats: data.issues or data.data
        const issuesList = data.issues || data.data || [];
        setIssues(issuesList);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setIssuesLoading(false);
    }
  };

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

  const stats = {
    total: issues.length,
    pending: issues.filter(i => ['pending', 'assigned', 'in-progress', 'reopened'].includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved').length
  };

  return (
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
          <StatCard label={t('citizen.totalReports')} value={stats.total} icon="📄" />
          <StatCard label={t('citizen.pending')} value={stats.pending} icon="⏰" />
          <StatCard label={t('citizen.resolved')} value={stats.resolved} icon="✅" />
        </div>

        {/* ── NEARBY MAP ── */}
        {userLoc && (
          <div className="animate-fade-in shadow-2xl rounded-3xl overflow-hidden border border-border">
            <NearbyIssuesMap center={userLoc} />
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
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-48 animate-pulse bg-white/5 border-white/10" />
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
  );
}
