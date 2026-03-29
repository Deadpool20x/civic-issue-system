'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useStaticTranslation';
import toast from 'react-hot-toast';

// Status badge component
function StatusBadge({ status }) {
  const { t } = useTranslation();
  const statusStyles = {
    'pending': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'assigned': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'in-progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'in progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'resolved': 'bg-green-500/20 text-green-400 border border-green-500/40',
    'rejected': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'escalated': 'bg-red-600/20 text-red-300 border border-red-600/40',
    'reopened': 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  };

  const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {(t(`status.${status?.toLowerCase()}`) || status?.replace('-', ' ')).toUpperCase()}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }) {
  const { t } = useTranslation();
  const priorityStyles = {
    'urgent': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    'low': 'bg-green-500/20 text-green-400 border border-green-500/40',
  };

  const style = priorityStyles[priority?.toLowerCase()] || priorityStyles.medium;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {t(`priority.${priority?.toLowerCase() || 'medium'}`).toUpperCase()}
    </span>
  );
}

// SLA Status display
function SLADisplay({ deadline, isOverdue }) {
  const { t } = useTranslation();
  if (!deadline) {
    return <span className="text-[#AAAAAA]">{t('common.noData')}</span>;
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const isPast = deadlineDate < now;

  if (isPast || isOverdue) {
    return (
      <span className="text-red-400 font-medium">
        ⚠️ {t('track.overdue').toUpperCase()}
      </span>
    );
  }

  const diffMs = deadlineDate - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 2) {
    return <span className="text-red-400 font-medium">{t('track.hoursLeft', { hours: '< 2' })}</span>;
  } else if (diffHours < 12) {
    return <span className="text-amber-400 font-medium">{t('track.hoursLeft', { hours: diffHours })}</span>;
  } else if (diffDays < 1) {
    return <span className="text-amber-400 font-medium">{t('track.hoursLeft', { hours: diffHours })}</span>;
  } else {
    return <span className="text-green-400 font-medium">{t('track.daysLeft', { days: diffDays })}</span>;
  }
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Status Timeline Component (simplified for public view)
function StatusTimeline({ statusHistory }) {
  const { t } = useTranslation();
  if (!statusHistory || statusHistory.length === 0) {
    return <p className="text-[#666666] text-sm">{t('track.noHistory', 'No status updates yet')}</p>;
  }

  return (
    <div className="space-y-3">
      {statusHistory.slice(0, 5).map((entry, index) => {
        const isCompleted = index === 0;
        
        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-[#333333]'}`} />
              {index < statusHistory.length - 1 && (
                <div className="w-0.5 h-8 bg-[#333333]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isCompleted ? 'text-white' : 'text-[#AAAAAA]'}`}>
                  {(t(`status.${entry.status?.toLowerCase()}`) || entry.status?.replace('-', ' ')).toUpperCase()}
                </span>
                <span className="text-xs text-[#666666]">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              {entry.note && (
                <p className="text-xs text-[#666666] mt-1">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Navbar Component
function Navbar() {
  const { t } = useTranslation();
  return (
    <nav className="bg-[#080808] border-b border-[#333333] px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5A623] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">{t('nav.title')}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[#AAAAAA] hover:text-white transition-colors text-sm font-medium">
            {t('nav.signIn')}
          </Link>
          <Link href="/register" className="bg-[#F5A623] text-black font-semibold rounded-full px-5 py-2 text-sm hover:bg-[#E09010] transition-colors">
            {t('nav.signUp')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Footer Component
function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#080808] border-t border-[#333333] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F5A623] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">{t('nav.title')}</span>
            </div>
            <p className="text-[#666666] text-sm">
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <div className="space-y-2">
              <Link href="/map" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">{t('footer.issueMap')}</Link>
              <Link href="/track" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">{t('footer.trackComplaint')}</Link>
              <Link href="/know-your-district" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">{t('footer.knowDistrict')}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
            <div className="space-y-2">
              <Link href="/privacy-policy" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">{t('footer.privacyPolicy')}</Link>
              <Link href="/terms-of-service" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">{t('footer.termsOfService')}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            <p className="text-[#666666] text-sm">support@civicpulse.in</p>
            <p className="text-[#666666] text-sm mt-2">Anand District, Gujarat, India</p>
          </div>
        </div>
        <div className="border-t border-[#333333] pt-8 text-center">
          <p className="text-[#666666] text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function TrackPage() {
  const { t } = useTranslation();
  const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!reportId.trim()) {
      setError(t('track.enterIdHint', 'Please enter a Report ID'));
      return;
    }

    setLoading(true);
    setError('');
    setIssue(null);

    try {
      const res = await fetch(`/api/issues/track?reportId=${encodeURIComponent(reportId.trim())}`);
      const data = await res.json();

      if (data.success) {
        setIssue(data.data);
      } else {
        setError(data.error || t('track.notFound'));
      }
    } catch (err) {
      console.error('Track error:', err);
      setError(t('track.fetchError', 'Failed to fetch complaint details'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t('track.title')}
          </h1>
          <p className="text-[#AAAAAA] text-lg mb-10">
            {t('track.subtitle')}
          </p>

          {/* Search Box */}
          <div className="max-w-lg mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={reportId}
                onChange={(e) => setReportId(e.target.value.toUpperCase())}
                placeholder={t('track.placeholder')}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[#222222] border border-[#333333] rounded-full text-white placeholder:text-[#666666] px-6 py-4 text-lg focus:border-[#F5A623] focus:outline-none uppercase tracking-wider"
              />
              <button
                onClick={handleTrack}
                disabled={loading}
                className="bg-[#F5A623] text-black font-bold rounded-full px-8 py-4 hover:bg-[#E09010] transition disabled:opacity-50"
              >
                {loading ? '...' : t('track.button')}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-[12px] p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Result Card */}
      {issue && (
        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 md:p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#F5A623] font-bold text-xl">
                  {issue.reportId}
                </span>
                <StatusBadge status={issue.status} />
              </div>

              {/* Issue title */}
              <h2 className="text-white text-xl font-bold mb-6">
                {issue.title}
              </h2>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{t('track.category')}</p>
                  <p className="text-white font-medium capitalize">{t(`report.categories.${issue.category}.label`, issue.category?.replace(/-/g, ' '))}</p>
                </div>
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{t('track.department')}</p>
                  <p className="text-white font-medium capitalize">{issue.department?.replace(/-/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{t('track.ward')}</p>
                  <p className="text-white font-medium">{issue.ward}</p>
                </div>
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{t('track.reported')}</p>
                  <p className="text-white font-medium">{formatDate(issue.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{t('track.priority')}</p>
                  <PriorityBadge priority={issue.priority} />
                </div>
                <div>
                  <p className="text-[#666666] text-xs uppercase tracking-wider mb-1">{t('track.slaStatus')}</p>
                  <SLADisplay deadline={issue.sla?.deadline} isOverdue={issue.sla?.isOverdue} />
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border-t border-[#333333] pt-6">
                <p className="text-[#666666] text-xs uppercase tracking-wider mb-4">
                  {t('track.timeline')}
                </p>
                <StatusTimeline statusHistory={issue.statusHistory} />
              </div>

              {/* Login CTA */}
              <div className="border-t border-[#333333] pt-6 mt-6 text-center">
                <p className="text-[#666666] text-sm">
                  {t('track.isThisYours')}{' '}
                  <Link href="/login" className="text-[#F5A623] hover:underline">
                    {t('nav.signIn')}
                  </Link>
                  {' '}{t('track.signInForDetails')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Not Found State - only show when there's an error but no issue */}
      {!issue && !loading && error && (
        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-8">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-white text-xl font-bold mb-2">{t('track.notFound')}</h3>
              <p className="text-[#666666] mb-6">
                {t('track.notFoundDesc')}
              </p>
              <div className="text-left bg-[#222222] rounded-[12px] p-4 inline-block">
                <p className="text-[#AAAAAA] text-sm">
                  <strong className="text-white">{t('track.tips')}:</strong>
                </p>
                <ul className="text-[#AAAAAA] text-sm mt-2 space-y-1">
                  {t('track.tipsList', { returnObjects: true })?.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
