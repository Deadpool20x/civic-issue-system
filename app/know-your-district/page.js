'use client';

import Link from 'next/link';

const northZone = [
  { id: 'ward-1', name: 'Ward 1', zone: 'North Zone' },
  { id: 'ward-2', name: 'Ward 2', zone: 'North Zone' },
  { id: 'ward-3', name: 'Ward 3', zone: 'North Zone' },
  { id: 'ward-4', name: 'Ward 4', zone: 'North Zone' },
  { id: 'ward-5', name: 'Ward 5', zone: 'North Zone' },
  { id: 'ward-6', name: 'Ward 6', zone: 'North Zone' },
  { id: 'ward-7', name: 'Ward 7', zone: 'North Zone' },
  { id: 'ward-8', name: 'Ward 8', zone: 'North Zone' },
];

const southZone = [
  { id: 'ward-9', name: 'Ward 9', zone: 'South Zone' },
  { id: 'ward-10', name: 'Ward 10', zone: 'South Zone' },
  { id: 'ward-11', name: 'Ward 11', zone: 'South Zone' },
  { id: 'ward-12', name: 'Ward 12', zone: 'South Zone' },
  { id: 'ward-13', name: 'Ward 13', zone: 'South Zone' },
  { id: 'ward-14', name: 'Ward 14', zone: 'South Zone' },
  { id: 'ward-15', name: 'Ward 15', zone: 'South Zone' },
  { id: 'ward-16', name: 'Ward 16', zone: 'South Zone' },
];

const departments = [
  {
    id: 'roads',
    icon: '🛣️',
    name: 'Roads & Infrastructure',
    handles: 'Potholes, road damage, footpath repairs, bridge maintenance',
    email: 'roads@civicpulse.in'
  },
  {
    id: 'water',
    icon: '💧',
    name: 'Water Supply',
    handles: 'Water leakage, no water supply, pipeline breaks',
    email: 'water@civicpulse.in'
  },
  {
    id: 'waste',
    icon: '🗑️',
    name: 'Waste Management',
    handles: 'Garbage collection, overflowing bins, illegal dumping',
    email: 'waste@civicpulse.in'
  },
  {
    id: 'lighting',
    icon: '💡',
    name: 'Street Lighting',
    handles: 'Broken streetlights, no lighting in area, damaged poles',
    email: 'lighting@civicpulse.in'
  },
  {
    id: 'parks',
    icon: '🌳',
    name: 'Parks & Public Spaces',
    handles: 'Park damage, overgrown areas, broken benches, fallen trees',
    email: 'parks@civicpulse.in'
  },
  {
    id: 'traffic',
    icon: '🚦',
    name: 'Traffic & Signage',
    handles: 'Missing signs, damaged signals, faded road markings',
    email: 'traffic@civicpulse.in'
  },
  {
    id: 'health',
    icon: '🏥',
    name: 'Public Health & Safety',
    handles: 'Stray animals, mosquito breeding, open manholes, hazardous material',
    email: 'health@civicpulse.in'
  },
  {
    id: 'general',
    icon: '📋',
    name: 'General Issues',
    handles: 'Issues that do not fit other categories',
    email: 'general@civicpulse.in'
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

export default function KnowYourDistrict() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Know Your District
          </h1>
          <p className="text-[#AAAAAA] text-lg">
            Anand District, Gujarat
          </p>
        </div>
      </section>

      {/* District Overview Cards */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="text-3xl font-bold text-[#F5A623] mb-2">16</div>
              <div className="text-[#AAAAAA] text-sm">Total Wards</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="text-3xl font-bold text-[#F5A623] mb-2">8</div>
              <div className="text-[#AAAAAA] text-sm">Departments</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="text-3xl font-bold text-[#F5A623] mb-2">2</div>
              <div className="text-[#AAAAAA] text-sm">Zones</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="text-3xl font-bold text-[#F5A623] mb-2">1</div>
              <div className="text-[#AAAAAA] text-sm">District</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ward Directory Section */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Ward Directory
          </h2>

          {/* North Zone */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              North Zone (Ward 1-8)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {northZone.map((ward) => (
                <Link
                  key={ward.id}
                  href={`/map?ward=${ward.id}`}
                  className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-5 hover:border-[#F5A623]/40 transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#F5A623] font-bold text-xl">
                      {ward.name}
                    </span>
                  </div>
                  <span className="text-[#AAAAAA] text-sm group-hover:text-[#F5A623] transition flex items-center gap-1">
                    View issues →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* South Zone */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
              South Zone (Ward 9-16)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {southZone.map((ward) => (
                <Link
                  key={ward.id}
                  href={`/map?ward=${ward.id}`}
                  className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-5 hover:border-[#F5A623]/40 transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#F5A623] font-bold text-xl">
                      {ward.name}
                    </span>
                  </div>
                  <span className="text-[#AAAAAA] text-sm group-hover:text-[#F5A623] transition flex items-center gap-1">
                    View issues →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Municipal Departments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
                <div className="text-4xl mb-4">{dept.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{dept.name}</h3>
                <p className="text-[#AAAAAA] text-sm mb-4 leading-relaxed">
                  {dept.handles}
                </p>
                <a href={`mailto:${dept.email}`} className="text-[#F5A623] text-sm hover:underline">
                  {dept.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Report Section */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            How to Report an Issue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="w-12 h-12 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">1</span>
              </div>
              <h3 className="text-white font-bold mb-2">Register</h3>
              <p className="text-[#AAAAAA] text-sm">
                Create a free account on CivicPulse
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="w-12 h-12 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">2</span>
              </div>
              <h3 className="text-white font-bold mb-2">Report</h3>
              <p className="text-[#AAAAAA] text-sm">
                Submit your civic issue with photo & location
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6 text-center">
              <div className="w-12 h-12 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-xl">3</span>
              </div>
              <h3 className="text-white font-bold mb-2">Track</h3>
              <p className="text-[#AAAAAA] text-sm">
                Monitor status and get resolution updates
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/register" className="inline-block bg-[#F5A623] text-black font-bold rounded-full px-8 py-3 hover:bg-[#E09010] transition">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
