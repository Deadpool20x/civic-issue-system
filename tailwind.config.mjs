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
            },
            animation: {
                'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
                'star-movement-top': 'star-movement-top linear infinite alternate',
                'spotlight-fade': 'spotlight-fade 0.5s ease-in-out'
            },
            keyframes: {
                'star-movement-bottom': {
                    '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
                    '100%': { transform: 'translate(-100%, 0%)', opacity: '0' }
                },
                'star-movement-top': {
                    '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
                    '100%': { transform: 'translate(100%, 0%)', opacity: '0' }
                },
                'spotlight-fade': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                }
            }
        }
    },
    plugins: []
};

export default config;