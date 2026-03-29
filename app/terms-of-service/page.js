'use client';

import Link from 'next/link';

const terms = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using CivicPulse, you agree to be bound by
    these Terms of Service. If you do not agree, please do not use the platform.
    These terms apply to all users including citizens, field officers,
    department managers, and administrators.`
  },
  {
    title: "2. Eligible Use",
    content: `CivicPulse is a civic issue reporting platform for residents
    of Anand District, Gujarat. You must:
    • Be a resident or authorized official of the district
    • Provide accurate information when registering
    • Use the platform only for legitimate civic issue reporting
    • Be at least 13 years of age`
  },
  {
    title: "3. Acceptable Use Policy",
    content: `You agree NOT to:
    • Submit false, misleading, or fabricated complaints
    • Upload offensive, illegal, or inappropriate content
    • Attempt to access other users' accounts or data
    • Use the platform to harass officials or other citizens
    • Submit spam or duplicate complaints intentionally
    • Attempt to circumvent role-based access restrictions
    
    Violation of these rules may result in account suspension.`
  },
  {
    title: "4. Complaint Submission",
    content: `When submitting a complaint you confirm that:
    • The issue is real and located in the district
    • Photos/videos uploaded are genuine and relevant
    • You are reporting in good faith
    • You consent to the complaint being publicly visible
    
    CivicPulse reserves the right to remove complaints that
    violate these terms or are determined to be false.`
  },
  {
    title: "5. AI-Assisted Processing",
    content: `CivicPulse uses artificial intelligence to analyze uploaded
    images and suggest issue categories. AI suggestions are not always
    accurate — you are responsible for reviewing and confirming the
    correct category before submission. The platform is not liable
    for misrouting caused by AI detection errors that the user confirmed.`
  },
  {
    title: "6. Intellectual Property",
    content: `Photos and videos you upload remain your property.
    By uploading, you grant CivicPulse a non-exclusive license to
    display and use them for civic issue documentation and platform
    transparency purposes. The CivicPulse platform, logo, and code
    are the intellectual property of their respective owners.`
  },
  {
    title: "7. Disclaimer of Warranties",
    content: `CivicPulse provides the platform on an "as-is" basis.
    We do not guarantee:
    • That every issue will be resolved within SLA timelines
    • Uninterrupted or error-free platform availability
    • That AI detection will always be accurate
    
    Resolution of issues depends on municipal authorities and
    field officers — CivicPulse is a reporting and tracking tool only.`
  },
  {
    title: "8. Limitation of Liability",
    content: `CivicPulse shall not be liable for:
    • Failure of authorities to resolve reported issues
    • Any damages arising from platform downtime
    • Loss of data due to technical failures
    • Actions taken by municipal staff based on reports`
  },
  {
    title: "9. Account Termination",
    content: `We reserve the right to suspend or terminate accounts that:
    • Violate these Terms of Service
    • Submit repeated false complaints
    • Attempt to misuse the platform
    
    Citizens may delete their own account by contacting support.`
  },
  {
    title: "10. Governing Law",
    content: `These Terms are governed by the laws of India and the
    state of Gujarat. Any disputes shall be subject to the jurisdiction
    of courts in Anand District, Gujarat.`
  },
  {
    title: "11. Changes to Terms",
    content: `We may update these Terms at any time. Continued use of
    the platform after changes constitutes acceptance. Major changes
    will be communicated via email to registered users.`
  },
  {
    title: "12. Contact",
    content: `For terms-related questions:
    Email: support@civicpulse.in
    Address: Anand District, Gujarat, India`
  }
];

// Navbar Component
function Navbar() {
  return (
    <nav className="bg-[#080808] border-b border-[#333333] px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5A623] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Civic System</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[#AAAAAA] hover:text-white transition-colors text-sm font-medium">
            Login
          </Link>
          <Link href="/register" className="bg-[#F5A623] text-black font-semibold rounded-full px-5 py-2 text-sm hover:bg-[#E09010] transition-colors">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Footer Component
function Footer() {
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
              <span className="text-lg font-bold text-white">Civic System</span>
            </div>
            <p className="text-[#666666] text-sm">
              Empowering citizens to report and track civic issues for a better community.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/map" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">Issue Map</Link>
              <Link href="/track" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">Track Complaint</Link>
              <Link href="/know-your-district" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">Know Your District</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <Link href="/privacy-policy" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">Privacy Policy</Link>
              <Link href="/terms-of-service" className="block text-[#AAAAAA] hover:text-[#F5A623] text-sm">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-[#666666] text-sm">support@civicpulse.in</p>
            <p className="text-[#666666] text-sm mt-2">Anand District, Gujarat, India</p>
          </div>
        </div>
        <div className="border-t border-[#333333] pt-8 text-center">
          <p className="text-[#666666] text-sm">
            © 2026 Civic System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-[#AAAAAA]">
            Last updated: March 2026
          </p>
          <div className="w-16 h-1 bg-[#F5A623] mt-4 rounded-full" />
        </div>

        {/* Intro */}
        <div className="bg-[#1A1A1A] border border-[#F5A623]/30 rounded-[20px] p-6 mb-8">
          <p className="text-[#AAAAAA] leading-relaxed">
            Welcome to CivicPulse. By using our civic issue reporting platform,
            you agree to these Terms of Service. Please read them carefully before
            using the platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {terms.map((term, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
              <h2 className="text-white font-bold text-lg mb-3">
                {term.title}
              </h2>
              <p className="text-[#AAAAAA] leading-relaxed whitespace-pre-line">
                {term.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
