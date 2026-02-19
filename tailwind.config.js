/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Sora', 'sans-serif'],
                serif: ['Lora', 'serif'],
            },
            colors: {
                background: '#f0f2f5',
                card: '#ffffff',
                primary: '#3b82f6',
                dark: '#0f172a',
                'dark-light': '#1e293b',
            },
            borderRadius: {
                '3xl': '22px',
            },
            boxShadow: {
                card: '0 2px 12px rgba(0,0,0,0.05)',
                lift: '0 6px 20px rgba(0,0,0,0.08)',
            },
            animation: {
                'fade-up': 'fadeUp 0.38s cubic-bezier(.22,1,.36,1) both',
                'fade-in': 'fadeIn 0.3s ease-out both',
                'scale-in': 'scaleIn 0.4s cubic-bezier(.34,1.56,.64,1) both',
                'slide-right': 'slideRight 0.3s cubic-bezier(.34,1.56,.64,1) both',
                'slide-down': 'slideDown 0.3s cubic-bezier(.34,1.56,.64,1) both',
                'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-custom': 'bounce 0.5s ease',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(18px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.88)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-24px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-12px) scaleY(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scaleY(1)' },
                },
                bounce: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '40%': { transform: 'scale(1.25)' },
                    '70%': { transform: 'scale(0.9)' },
                }
            }
        },
    },
    plugins: [],
}
