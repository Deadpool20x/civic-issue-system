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
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Unified Design System - Premium Color Palette
                brand: {
                    primary: "#006989", // Ocean - primary actions, headers, buttons
                    soft: "#eaeebd",    // Soft backgrounds, highlights
                },
                accent: {
                    lavender: "#B492F0", // Subtle highlights, accents (updated to match spec)
                    magic: "#5E429C",    // Navigation active states
                },
                status: {
                    success: "#10B981",  // Soft Green - success, resolved
                    warning: "#FE7F2D",  // Sunset - warnings, medium priority
                    error: "#D7263D",    // Crimson - errors, destructive actions
                    pending: "#FE7F2D",  // Sunset - pending
                    progress: "#006989", // Ocean - in progress
                },
                contrast: {
                    primary: "#02182B",  // Nights - text headers, dark sections
                    secondary: "#1f2937", // slate-800 - secondary text
                    light: "#64748b",    // slate-500 - tertiary text
                },
                neutral: {
                    bg: "#f8fafc",       // Light neutral background
                    border: "#e5e7eb",   // Border color
                    surface: "#ffffff",  // Card/surface color
                }
            },
        }
    },
    plugins: []
};

export default config;