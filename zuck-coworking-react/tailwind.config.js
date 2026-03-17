/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gather: {
                    blue: '#3498db',
                    green: '#8bc34a',
                    dark: '#0a0e17',
                    card: '#111827',
                    border: '#1f2937',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
