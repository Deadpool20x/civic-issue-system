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
                // Premium Color System - Updated to match requirements
                brand: {
                    primary: "#006989", // Ocean - primary actions, headers
                    soft: "#eaeebd",    // Dreamy - soft backgrounds
                },
                accent: {
                    lavender: "#f492f0", // Subtle highlights
                    magic: "#5E429C",    // Navigation active states
                },
                status: {
                    warning: "#FE7F2D",  // Sunset - warnings, medium priority
                    error: "#D7263D",    // Crimson - errors, destructive actions
                    pending: "#FE7F2D",  // Sunset - pending
                    progress: "#006989", // Ocean - in progress
                    resolved: "#10B981", // Emerald - resolved
                },
                contrast: {
                    primary: "#02182B",  // Nights - text headers, dark sections
                    secondary: "#1f2937", // slate-800
                }
            },
        }
    },
    plugins: []
};

export default config;