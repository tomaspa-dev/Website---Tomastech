/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// New vibrant palette - uses CSS vars for theme switching
				background: 'var(--color-bg)',
				surface: 'var(--color-surface)',
				'surface-hover': 'var(--color-surface-hover)',
				border: 'var(--color-border)',
				'border-hover': 'var(--color-border-hover)',
				'text-primary': 'var(--color-text-primary)',
				'text-secondary': 'var(--color-text-secondary)',
				'text-muted': 'var(--color-text-muted)',
				// Brand colors
				primary: {
					DEFAULT: '#818cf8', // Indigo-400 (brighter)
					50: '#eef2ff',
					100: '#e0e7ff',
					200: '#c7d2fe',
					300: '#a5b4fc',
					400: '#818cf8',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca',
					800: '#3730a3',
					900: '#312e81',
				},
				secondary: {
					DEFAULT: '#c084fc', // Purple-400 (brighter)
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea',
				},
				accent: {
					DEFAULT: '#f472b6', // Pink-400 (brighter)
					400: '#f472b6',
					500: '#ec4899',
					600: '#db2777',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				heading: ['Space Grotesk', 'sans-serif'],
				display: ['Sora', 'sans-serif'],
			},
			animation: {
				'gradient-x': 'gradient-x 5s ease infinite',
				'float': 'float 6s ease-in-out infinite',
				'float-delayed': 'float 6s ease-in-out 2s infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'border-flow': 'border-flow 3s ease infinite',
			},
			keyframes: {
				'gradient-x': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				'glow-pulse': {
					'0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.05)' },
				},
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				'border-flow': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				},
			},
			boxShadow: {
				'glow-primary': '0 0 20px rgba(129, 140, 248, 0.4), 0 0 60px rgba(129, 140, 248, 0.1)',
				'glow-secondary': '0 0 20px rgba(192, 132, 252, 0.4), 0 0 60px rgba(192, 132, 252, 0.1)',
				'glow-accent': '0 0 20px rgba(244, 114, 182, 0.4), 0 0 60px rgba(244, 114, 182, 0.1)',
				'glow-white': '0 0 20px rgba(255, 255, 255, 0.15)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-mesh': 'linear-gradient(135deg, var(--mesh-1) 0%, var(--mesh-2) 50%, var(--mesh-3) 100%)',
			},
		},
	},
	plugins: [],
}
