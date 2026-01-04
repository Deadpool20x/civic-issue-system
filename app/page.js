'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their dashboard
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-civic-bg">
        <div className="text-lg text-civic-text-secondary">Loading...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-civic-bg text-civic-text-primary">
      {/* Navigation */}
      <nav className="bg-civic-card border-b border-civic-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-16 gap-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-civic-text-primary">Civic Issue System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-civic-text-secondary hover:text-civic-text-primary px-3 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-civic-accent hover:bg-civic-accent-hover text-white px-4 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 pb-12 md:pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-civic-text-primary mb-6">
            Report & Track
            <span className="block text-civic-accent">Civic Issues</span>
          </h1>
          <p className="text-xl text-civic-text-secondary mb-8 max-w-3xl mx-auto">
            A digital platform designed to streamline the reporting, tracking, and resolution of civic issues.
            Enhancing transparency, accountability, and responsiveness in civic governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-civic-accent text-white hover:bg-civic-accent-hover px-8 py-4 rounded-lg text-lg font-medium transition-all shadow-lg shadow-blue-500/30 min-h-[44px] flex items-center justify-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-transparent text-civic-accent hover:bg-civic-input border border-civic-accent px-8 py-4 rounded-lg text-lg font-medium transition-colors min-h-[44px] flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-civic-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-civic-text-secondary">
            Simple steps to report and resolve civic issues
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-civic-card border border-civic-border rounded-xl shadow-xl p-6 text-center hover:bg-civic-input transition-colors">
            <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-civic-text-primary mb-2">Report Issue</h3>
            <p className="text-civic-text-secondary">
              Citizens can easily report civic issues with photos, location, and detailed descriptions.
            </p>
          </div>

          <div className="bg-civic-card border border-civic-border rounded-xl shadow-xl p-6 text-center hover:bg-civic-input transition-colors">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-civic-text-primary mb-2">AI Processing</h3>
            <p className="text-civic-text-secondary">
              AI automatically categorizes issues, assigns priority levels, and routes to appropriate departments.
            </p>
          </div>

          <div className="bg-civic-card border border-civic-border rounded-xl shadow-xl p-6 text-center hover:bg-civic-input transition-colors">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-civic-text-primary mb-2">Track Progress</h3>
            <p className="text-civic-text-secondary">
              Real-time tracking of issue status with notifications and updates throughout the resolution process.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-civic-card border-t border-civic-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-civic-text-primary mb-12">
              Supporting Roles
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-blue-500 mb-2">Citizens</div>
              <div className="text-civic-text-secondary">Report and track issues</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-green-500 mb-2">Municipal</div>
              <div className="text-civic-text-secondary">Manage all issues</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-purple-500 mb-2">Departments</div>
              <div className="text-civic-text-secondary">Resolve specific issues</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-orange-500 mb-2">Admins</div>
              <div className="text-civic-text-secondary">System administration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 border-t border-civic-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-civic-text-primary">Civic Issue System</h3>
            <p className="text-gray-500">
              Enhancing transparency, accountability, and responsiveness in civic governance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
