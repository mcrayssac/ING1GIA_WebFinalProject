/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
			"oklch-p": "oklch(var(--p))", 
			"oklch-pc": "oklch(var(--pc))",
  			background: 'oklch(var(--b1))',
  			foreground: 'oklch(var(--p))',
  			card: {
  				DEFAULT: 'oklch(var(--p))',
  				foreground: 'oklch(var(--pc))'
  			},
  			popover: {
  				DEFAULT: 'oklch(var(--pc))',
  				foreground: 'oklch(var(--p))'
  			},
  			primary: {
  				DEFAULT: 'oklch(var(--p))',
  				foreground: 'oklch(var(--pc))'
  			},
  			secondary: {
  				DEFAULT: 'oklch(var(--s))',
  				foreground: 'oklch(var(--sc))'
  			},
  			muted: {
  				DEFAULT: 'oklch(var(--ac))',
  				foreground: 'oklch(var(--a))'
  			},
  			accent: {
  				DEFAULT: 'oklch(var(--n))',
  				foreground: 'oklch(var(--nc))'
  			},
  			destructive: {
  				DEFAULT: 'oklch(var(--n))',
  				foreground: 'oklch(var(--nc))'
  			},
  			border: 'oklch(var(--nc))',
  			input: 'oklch(var(--nc))',
  			ring: 'oklch(var(--nc))',
  			chart: {
  				'1': 'oklch(var(--p))',
  				'2': 'oklch(var(--s))',
  				'3': 'oklch(var(--a))',
  				'4': 'oklch(var(--n))',
  				'5': 'oklch(var(--ac))',
  			},
  			sidebar: {
  				DEFAULT: 'oklch(var(--b1))',
  				foreground: 'oklch(var(--p))',
  				primary: 'oklch(var(--pc))',
  				'primary-foreground': 'oklch(var(--p))',
  				accent: 'oklch(var(--n))',
  				'accent-foreground': 'oklch(var(--nc))',
  				border: 'oklch(var(--nc))',
  				ring: 'oklch(var(--n))',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  daisyui: {
    themes: [
		{
			light: {
				...require("daisyui/src/theming/themes")["light"],
				primary: "#435565",
				"primary-content": "#f1faee",
				secondary: "#e63946",
				"secondary-content": "#f1faee",
				accent: "#738A9A",
				"accent-content": "#f1faee",
				neutral: "#f1faee",
				"neutral-content": "#a8dadc",
				"base-100": "#f1faee",
				"base-200": "#aec6d0",
				"base-300": "#8eafbe",
				"base-content": "#6d98ab",
				info: "#3B82F6",
				"info-content": "#f1faee",
				success: "#10B981",
				"success-content": "#f1faee",
				warning: "#F59E0B",
				"warning-content": "#f1faee",
				error: "#EF4444",
				"error-content": "#f1faee",
			},
		},
		{
			dark: {
				...require("daisyui/src/theming/themes")["dark"],
				primary: "#872341",
				"primary-content": "#09122C",
				secondary: "#0077b6",
				"secondary-content": "#09122C",
				accent: "#E17564",
				"accent-content": "#09122C",
				neutral: "#09122C",
				"neutral-content": "#E17564",
				"base-100": "#09122C",
				"base-200": "#112255",
				"base-300": "#1a337f",
				"base-content": "#2344a9",
				info: "#3B82F6",
				"info-content": "#09122C",
				success: "#10B981",
				"success-content": "#09122C",
				warning: "#F59E0B",
				"warning-content": "#09122C",
				error: "#EF4444",
				"error-content": "#09122C",
			},
		},
		"cupcake",
		"bumblebee",
		"emerald",
		"corporate",
		"synthwave",
		"retro",
		"cyberpunk",
		"valentine",
		"halloween",
		"garden",
		"forest",
		"aqua",
		"lofi",
		"pastel",
		"fantasy",
		"wireframe",
		"black",
		"luxury",
		"dracula",
		"cmyk",
		"autumn",
		"business",
		"acid",
		"lemonade",
		"night",
		"coffee",
		"winter",
		"dim",
		"nord",
		"sunset",
    ],
  },
  plugins: [require("tailwindcss-animate"), require('daisyui')],
};
