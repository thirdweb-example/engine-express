/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1400px',
			},
		},
		colors: {
			current: 'currentColor',
			border: 'var(--border)',
			input: 'var(--b-200)',
			ring: 'var(--accent-200)',
			transparent: 'transparent',
			b: {
				100: 'var(--b-100)',
				200: 'var(--b-200)',
			},
			f: {
				900: 'var(--f-900)',
				500: 'var(--f-500)',
				200: 'var(--f-200)',
			},
			accent: {
				500: 'var(--accent-500)',
				600: 'var(--accent-600)',
			},
			danger: {
				500: 'var(--danger-500)',
			},
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)',
		},
		fontFamily: {
			sans: ['var(--font-sans)', 'sans-serif'],
			decorative: ['var(--font-decorative)', 'sans-serif'],
		},
	},
	plugins: [require('tailwindcss-animate')],
};
