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
                // Mapping original hex codes to semantic names if needed, 
                // but Tailwind's slate/blue/emerald usually cover it.
                // Original bg: #f0f2f5 (slate-100/gray-100 mix)
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
