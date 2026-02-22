/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mint: {
                    DEFAULT: '#10b981',
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    dark: '#059669',
                    light: '#34d399',
                },
                navy: {
                    DEFAULT: '#0f172a',
                    light: '#1e293b',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
