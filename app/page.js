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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-16 gap-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Civic Issue System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center"
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
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Report & Track
            <span className="block text-blue-600">Civic Issues</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A digital platform designed to streamline the reporting, tracking, and resolution of civic issues.
            Enhancing transparency, accountability, and responsiveness in civic governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors min-h-[44px] flex items-center justify-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 hover:bg-gray-50 border border-blue-600 px-8 py-4 rounded-lg text-lg font-medium transition-colors min-h-[44px] flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Simple steps to report and resolve civic issues
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Issue</h3>
            <p className="text-gray-600">
              Citizens can easily report civic issues with photos, location, and detailed descriptions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Processing</h3>
            <p className="text-gray-600">
              AI automatically categorizes issues, assigns priority levels, and routes to appropriate departments.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Real-time tracking of issue status with notifications and updates throughout the resolution process.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-12">
              Supporting Roles
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Citizens</div>
              <div className="text-gray-600">Report and track issues</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">Municipal</div>
              <div className="text-gray-600">Manage all issues</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">Departments</div>
              <div className="text-gray-600">Resolve specific issues</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">Admins</div>
              <div className="text-gray-600">System administration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Civic Issue System</h3>
            <p className="text-gray-400">
              Enhancing transparency, accountability, and responsiveness in civic governance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
