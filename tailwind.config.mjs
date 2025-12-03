/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
			extend: {
			colors: {
				background: '#0a0a0a',
				primary: '#6366f1', // Indigo
				secondary: '#a855f7', // Purple
				accent: '#ec4899', // Pink
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				heading: ['Outfit', 'sans-serif'],
			},
			animation: {
				gradient: {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				},
			},
		},
	},
	plugins: [],
}
