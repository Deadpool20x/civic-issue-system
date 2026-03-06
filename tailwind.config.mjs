/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                /* ============================================================
                   CIVIC ISSUE SYSTEM — DARK THEME PALETTE
                   Source: SYSTEM_FEATURES_MASTER.md
                   ============================================================ */

                // Core backgrounds
                page: "#0A0A0A",  // Page background
                navbar: "#080808",  // Navbar & footer
                card: "#1A1A1A",  // Cards, panels, modals
                input: "#222222",  // Form inputs, search bars
                border: "#333333",  // All borders, dividers

                // Gold accent system
                gold: {
                    DEFAULT: "#F5A623",  // Primary accent — CTAs, active states
                    hover: "#E09010",  // Button hover
                    light: "rgba(245, 166, 35, 0.1)",   // Tinted backgrounds
                    border: "rgba(245, 166, 35, 0.4)",   // Gold borders
                    muted: "rgba(245, 166, 35, 0.6)",   // Muted gold
                },

                // Text hierarchy
                text: {
                    primary: "#FFFFFF",    // Headings, main content
                    secondary: "#AAAAAA",    // Labels, meta info
                    muted: "#666666",    // Placeholders, disabled
                },

                /* ============================================================
                   STATUS COLORS — Section H of spec
                   Usage: bg-status-pending/20 text-status-pending border-status-pending/40
                   ============================================================ */
                status: {
                    pending: "#6B7280",  // gray-500
                    assigned: "#3B82F6",  // blue-500
                    progress: "#F59E0B",  // amber-500
                    resolved: "#22C55E",  // green-500
                    rejected: "#EF4444",  // red-500
                    escalated: "#DC2626",  // red-600
                    reopened: "#A855F7",  // purple-500
                },

                /* ============================================================
                   PRIORITY COLORS — Section H of spec
                   ============================================================ */
                priority: {
                    urgent: "#EF4444",   // red-500
                    high: "#F97316",   // orange-500
                    medium: "#EAB308",   // yellow-500
                    low: "#22C55E",   // green-500
                },
            },

            /* ============================================================
               BORDER RADIUS — Design system tokens
               ============================================================ */
            borderRadius: {
                'card': '20px',
                'input': '12px',
                'pill': '9999px',
            },

            /* ============================================================
               ANIMATIONS — Micro-interactions
               ============================================================ */
            keyframes: {
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in': {
                    from: { opacity: '0', transform: 'translateX(-12px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                'pulse-gold': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 166, 35, 0.4)' },
                    '50%': { boxShadow: '0 0 0 8px rgba(245, 166, 35, 0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out forwards',
                'slide-in': 'slide-in 0.3s ease-out forwards',
                'pulse-gold': 'pulse-gold 2s infinite',
            },

            /* ============================================================
               FONT FAMILY — Modern web fonts
               ============================================================ */
            fontFamily: {
                sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['SF Mono', 'Fira Code', 'monospace'],
            },
        },
    },
    plugins: [],
};

export default config;