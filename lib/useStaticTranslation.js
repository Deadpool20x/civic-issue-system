const TRANSLATIONS = {
  // Navigation
  'nav.title': 'CivicPulse',
  'nav.signIn': 'Sign In',
  'nav.signUp': 'Sign Up',
  'nav.viewMap': 'View Issues Map',
  'nav.home': 'Home',
  'nav.sidebar.dashboard': 'Dashboard',
  'nav.sidebar.report': 'Report Issue',
  'nav.sidebar.issues': 'Issues',
  'nav.sidebar.resolved': 'Resolved',
  'nav.sidebar.performance': 'Performance',
  'nav.sidebar.profile': 'Profile',
  'nav.sidebar.map': 'Map',
  'nav.sidebar.public': 'Public',
  'nav.sidebar.myOfficers': 'My Officers',
  'nav.sidebar.sla': 'SLA Monitoring',
  'nav.sidebar.citymap': 'City Map',
  'nav.sidebar.allIssues': 'All Issues',
  'nav.sidebar.departments': 'Departments',
  'nav.sidebar.reports': 'Reports',
  'nav.sidebar.users': 'Users',
  'nav.sidebar.analytics': 'Analytics',
  'nav.sidebar.create': 'Create New',
  'nav.sidebar.publicDashboard': 'Public Dashboard',

  // Landing Page
  'landing.hero': 'Empowering Citizens. Enabling Smarter Cities.',
  'landing.subtext': 'Report civic issues instantly and track their resolution in real-time.',
  'landing.reportButton': 'Report Issue',
  'landing.howItWorks': 'How It Works',
  'landing.howItWorksSubtitle': 'Simple steps to report and resolve civic issues',
  'landing.aiProcessing': 'AI Processing',
  'landing.aiProcessingDesc': 'AI automatically categorizes issues, assigns priority levels, and routes to appropriate departments.',
  'landing.reportSubmitDesc': 'Citizens can easily report civic issues with photos, location, and detailed descriptions.',
  'landing.trackProgress': 'Track Progress',
  'landing.trackProgressDesc': 'Real-time tracking of issue status with notifications and updates throughout the resolution process.',
  'landing.faq': 'Frequently Asked Questions',
  'landing.faqSubtitle': 'Everything you need to know about the platform',
  'landing.supportingRoles': 'Supporting Roles',
  'landing.rolesSubtitle': 'A complete ecosystem for civic governance',

  // Roles
  'roles.citizen': 'Citizen',
  'roles.municipal': 'Dept. Manager',
  'roles.department': 'Field Officer',
  'roles.commissioner': 'Commissioner',
  'roles.admin': 'System Admin',
  'roles.department_manager': 'Department Manager',

  // Common
  'common.loading': 'Loading...',
  'common.search': 'Search',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.back': 'Back',
  'status.pending': 'Pending',
  'status.assigned': 'Assigned',
  'status.in-progress': 'In Progress',
  'status.resolved': 'Resolved',
  'status.rejected': 'Rejected',
  'priority.urgent': 'Urgent',
  'priority.high': 'High',
  'priority.medium': 'Medium',
  'priority.low': 'Low',

  // Descriptions
  'citizen.dashboardDesc': 'Report and track civic issues in your neighborhood',
  'department.managerDesc': 'Manage departments and monitor SLA compliance',
  'department.fieldDesc': 'Field officers resolve issues ward by ward',
  'admin.systemDesc': 'System configuration and user management',

  // Footer & Misc
  'footer.tagline': 'Empowering citizens to report and track civic issues for a better community.',
  'footer.quickLinks': 'Quick Links',
  'footer.trackComplaint': 'Track Complaint',
  'footer.knowDistrict': 'Know Your District',
  'footer.legal': 'Legal',
  'footer.privacyPolicy': 'Privacy Policy',
  'footer.termsOfService': 'Terms of Service',
  'footer.contact': 'Contact',
  'footer.copyright': '© {{year}} CivicPulse. All rights reserved.',
  'district.subtitle': 'Anand District, Gujarat',

  // FAQ
  'faq.q1': 'How do I report a civic issue?',
  'faq.a1': 'Register for a free account, log in, and click Report Issue. Fill in the title, description, select your ward, pin your location on the map, and upload a photo or video.',
  'faq.q2': 'How does AI detection work?',
  'faq.a2': 'When you upload a photo, our AI analyzes it using computer vision to identify the type of issue and routes it to the correct department.',
  'faq.q3': 'Can I track my complaint without logging in?',
  'faq.a3': 'Yes. Visit the Track Complaint page and enter your Report ID (e.g. R00042).',
  'faq.q4': 'How long does it take to resolve an issue?',
  'faq.a4': 'Resolution time depends on the priority: Urgent (24h), High (48h), Medium (72h), Low (7 days).',
  'faq.q5': 'What if my issue is not resolved after the deadline?',
  'faq.a5': 'Issues that exceed their SLA deadline are automatically escalated to senior authorities.',
  'faq.q6': 'Can I report the same issue that someone else already reported?',
  'faq.a6': 'Instead of creating a duplicate, you can upvote an existing issue to increase its visibility.',
  'faq.q7': 'In which languages is the platform available?',
  'faq.a7': 'The platform is available in English, Hindi, and Gujarati.',
  'faq.q8': 'Is my personal information safe?',
  'faq.a8': 'Yes. Your personal details are never shown publicly. Only your report content and location are visible.',
  'report.submit': 'Submit Issue',

  // Citizen Dashboard
  'citizen.dashboard': 'Dashboard',
  'citizen.dashboardSubtitle': 'Welcome back, {{name}}. You have {{count}} active issues.',
  'citizen.reportIssue': 'Report Issue',
  'citizen.totalReports': 'Total Reports',
  'citizen.pending': 'Pending',
  'citizen.resolved': 'Resolved',
  'citizen.inProgress': 'In Progress',
  'citizen.confirmFixed': 'Confirm Fixed',
  'citizen.requestReopen': 'Request Reopen',
  'citizen.verifiedFixed': '✓ Verified Fixed',
  'citizen.closeSuccess': 'Issue marked as resolved!',
  'citizen.reopenSuccess': 'Issue reopened successfully!',
  'citizen.noIssuesDesc': "You haven't reported any issues yet. Help improve the city by reporting your first issue.",
  'citizen.noIssuesFilteredDesc': 'No {{status}} issues found.',
  'citizen.reopenPlaceholder': 'Explain why this issue needs to be reopened...',

  // Common (additional)
  'common.noData': 'No Data Found',
  'common.justNow': 'just now',
  'common.hAgo': 'h ago',
  'common.dAgo': 'd ago',
};

export function useTranslation() {
  const t = (key, fallbackOrOptions) => {
    if (TRANSLATIONS[key]) {
      let text = TRANSLATIONS[key];
      if (typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null) {
        Object.keys(fallbackOrOptions).forEach(k => {
          text = text.replace(`{{${k}}}`, fallbackOrOptions[k]);
        });
      }
      return text;
    }

    if (typeof fallbackOrOptions === 'string') {
      return fallbackOrOptions;
    }

    return key;
  };

  return {
    t,
    i18n: {
      language: 'en',
      changeLanguage: async () => {}
    }
  };
}
