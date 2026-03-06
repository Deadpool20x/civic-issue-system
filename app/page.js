'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import LanguageSelector from '@/components/LanguageSelector';

const ROLE_DASHBOARDS = {
  'admin': '/admin/dashboard',
  'SYSTEM_ADMIN': '/admin/dashboard',
  'municipal': '/municipal/dashboard',
  'DEPARTMENT_MANAGER': '/municipal/dashboard',
  'department': '/department/dashboard',
  'FIELD_OFFICER': '/department/dashboard',
  'citizen': '/citizen/dashboard',
  'CITIZEN': '/citizen/dashboard',
  'commissioner': '/commissioner/dashboard',
  'MUNICIPAL_COMMISSIONER': '/commissioner/dashboard',
};

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  // Auto-redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(ROLE_DASHBOARDS[user.role] || '/citizen/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-white">
      {/* ── Navbar ── */}
      <nav className="bg-navbar border-b border-border sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/20">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Civic System</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <div className="h-6 w-px bg-border mx-1" />
              <Link
                href="/login"
                className="text-text-secondary hover:text-white px-3 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                href="/register"
                className="btn-gold px-6 py-2 text-sm font-bold shadow-lg shadow-gold/20"
              >
                {t('nav.signUp')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
          {t('landing.hero').split('.')[0]}
          <span className="block text-gold mt-2 drop-shadow-[0_0_15px_rgba(245,166,35,0.3)]">
            {t('landing.hero').split('.')[1] || ''}
          </span>
        </h1>
        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
          {t('landing.subtext')}
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
          <Link
            href="/register"
            className="btn-gold px-10 py-4 text-base font-bold shadow-xl shadow-gold/20 hover:scale-105 transition-transform"
          >
            {t('landing.reportButton')}
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 text-base font-bold border-2 border-border text-white rounded-pill hover:bg-white/5 transition-all hover:border-white"
          >
            {t('nav.signIn')}
          </Link>
        </div>

        <Link
          href="/public-dashboard"
          className="inline-flex items-center gap-3 px-8 py-3.5 bg-card border border-border rounded-pill text-text-secondary hover:text-gold hover:border-gold/40 transition-all font-bold text-sm shadow-xl hover:shadow-gold/10"
        >
          🗺️ {t('nav.viewMap')}
        </Link>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t('landing.howItWorks')}</h2>
          <p className="text-text-secondary text-lg font-medium opacity-70">Simple steps to report and resolve civic issues</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-3xl border border-border p-10 text-center hover:border-gold/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-gold/5 relative overflow-hidden">
            <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold/20 transition-colors shadow-inner">
              <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{t('report.submit')}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Citizens can easily report civic issues with photos, location, and detailed descriptions.
            </p>
          </div>

          {/* Card 2: AI Processing */}
          <div className="bg-card rounded-card border border-border p-8 text-center hover:border-gold/30 transition-colors group">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-green-500/20 transition-colors">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Processing</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              AI automatically categorizes issues, assigns priority levels, and routes to appropriate departments.
            </p>
          </div>

          {/* Card 3: Track Progress */}
          <div className="bg-card rounded-card border border-border p-8 text-center hover:border-gold/30 transition-colors group">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-purple-500/20 transition-colors">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Real-time tracking of issue status with notifications and updates throughout the resolution process.
            </p>
          </div>
        </div>
      </section>

      {/* ── Roles Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mb-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Supporting Roles</h2>
          <p className="text-text-secondary text-lg font-medium opacity-70">A complete ecosystem for civic governance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: t('citizen.citizen'), desc: 'Report and track civic issues in your neighborhood', emoji: '👤', color: 'gold' },
            { title: t('status.resolved'), desc: 'Manage departments and monitor SLA compliance', emoji: '🏛️', color: 'blue-400' },
            { title: 'Departments', desc: 'Field officers resolve issues ward by ward', emoji: '🔧', color: 'green-400' },
            { title: 'Admins', desc: 'System configuration and user management', emoji: '⚙️', color: 'purple-400' },
          ].map((role) => (
            <div
              key={role.title}
              className="bg-card rounded-3xl border border-border p-8 text-center hover:border-gold/30 transition-all hover:shadow-xl shadow-black/40 group"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{role.emoji}</div>
              <h3 className={`text-xl font-black text-white mb-3 tracking-tight`}>{role.title}</h3>
              <p className="text-text-secondary text-sm font-medium leading-relaxed opacity-60">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer: bg-[#080808] ── */}
      <footer className="bg-navbar border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-6 h-6 bg-gold rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Civic Issue System</h3>
          </div>
          <p className="text-text-muted text-sm">
            Enhancing transparency, accountability, and responsiveness in civic governance.
          </p>
          <p className="text-text-muted text-xs mt-4">
            © {new Date().getFullYear()} Civic Issue System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
