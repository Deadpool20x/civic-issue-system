'use client';

import Link from 'next/link';

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you register on CivicPulse, we collect:
    • Name and email address
    • Phone number (optional)
    • Address details (optional)
    • Location data when reporting issues (ward and coordinates)
    • Photos and videos uploaded with issue reports
    • Device information and browser type for security purposes`
  },
  {
    title: "2. How We Use Your Information",
    content: `Your information is used to:
    • Create and manage your account
    • Process and route civic complaints to the correct department
    • Send email notifications about your complaint status
    • Improve platform features and performance
    • Ensure platform security and prevent misuse
    We do not sell your personal data to any third party.`
  },
  {
    title: "3. What Is Publicly Visible",
    content: `The following information is publicly visible on our map and dashboard:
    • Issue title and description
    • Issue category and location (ward level — not exact coordinates)
    • Current status and resolution timeline
    • Photos uploaded with the complaint
    
    The following is NEVER publicly visible:
    • Your name, email, or contact details
    • Your exact GPS coordinates
    • Your account details`
  },
  {
    title: "4. Image and Video Storage",
    content: `Photos and videos uploaded with issue reports are stored securely using Cloudinary, a trusted media storage service. These files are used solely for civic issue documentation and may be viewed by relevant municipal authorities and the general public as part of issue transparency.`
  },
  {
    title: "5. Google Sign-In",
    content: `If you sign in using Google, we receive your name, email address, and profile picture from Google. This information is used only to create and manage your citizen account. We do not access your Google contacts, Drive files, or any other Google data. Staff accounts cannot use Google sign-in.`
  },
  {
    title: "6. Email Communications",
    content: `We send emails to notify you of:
    • Complaint status updates (assigned, in progress, resolved)
    • Issue escalation notifications
    • Password reset OTPs (when requested)
    
    You cannot unsubscribe from status update emails as they are core to the platform's function. We do not send marketing emails.`
  },
  {
    title: "7. Data Retention",
    content: `Your account data is retained as long as your account is active. Resolved complaints are retained for 2 years for municipal record keeping. You may request account deletion by contacting support@civicpulse.in. Deleted accounts have personal data removed, but anonymized complaint records may be retained for analytics.`
  },
  {
    title: "8. Security",
    content: `We implement the following security measures:
    • Passwords are hashed using bcrypt (never stored in plain text)
    • Authentication uses secure HTTP-only JWT cookies
    • All data transmission uses HTTPS encryption
    • Role-based access control ensures staff see only their authorized data`
  },
  {
    title: "9. Children's Privacy",
    content: `CivicPulse is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us immediately.`
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes acceptance of the updated policy.`
  },
  {
    title: "11. Contact Us",
    content: `For privacy-related questions or data deletion requests:
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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-[#AAAAAA]">
            Last updated: March 2026
          </p>
          <div className="w-16 h-1 bg-[#F5A623] mt-4 rounded-full" />
        </div>

        {/* Intro */}
        <div className="bg-[#1A1A1A] border border-[#F5A623]/30 rounded-[20px] p-6 mb-8">
          <p className="text-[#AAAAAA] leading-relaxed">
            CivicPulse ("we", "our", or "us") is committed to protecting
            your privacy. This policy explains how we collect, use, and
            safeguard your personal information when you use our civic
            issue reporting platform.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
              <h2 className="text-white font-bold text-lg mb-3">
                {section.title}
              </h2>
              <p className="text-[#AAAAAA] leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
