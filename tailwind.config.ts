
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			adinox: {
    				teal: 'hsl(168, 76%, 42%)',
    				'light-teal': 'hsl(168, 60%, 55%)',
    				'soft-teal': 'hsl(168, 50%, 75%)',
    				'pale-teal': 'hsl(168, 40%, 92%)',
    				red: 'hsl(0, 72%, 56%)',
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: { height: '0' },
    				to: { height: 'var(--radix-accordion-content-height)' }
    			},
    			'accordion-up': {
    				from: { height: 'var(--radix-accordion-content-height)' },
    				to: { height: '0' }
    			},
    			'pulse-ring': {
    				'0%': { transform: 'scale(0.85)', opacity: '0.8' },
    				'100%': { transform: 'scale(1.15)', opacity: '0' }
    			},
    			countdown: {
    				'0%': { strokeDashoffset: '0' },
    				'100%': { strokeDashoffset: '283' }
    			},
    			float: {
    				'0%, 100%': { transform: 'translateY(0)' },
    				'50%': { transform: 'translateY(-6px)' }
    			},
    			shimmer: {
    				'0%': { backgroundPosition: '-200% 0' },
    				'100%': { backgroundPosition: '200% 0' }
    			},
    			'spin-slow': {
    				'0%': { transform: 'rotate(0deg)' },
    				'100%': { transform: 'rotate(360deg)' }
    			},
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
    			countdown: 'countdown 30s linear infinite',
    			float: 'float 3s ease-in-out infinite',
    			shimmer: 'shimmer 2.5s linear infinite',
    			'spin-slow': 'spin-slow 6s linear infinite',
    		},
    		boxShadow: {
    			'glow-sm': '0 0 10px rgba(20, 184, 166, 0.15)',
    			'glow-md': '0 0 20px rgba(20, 184, 166, 0.2)',
    			'glow-lg': '0 0 30px rgba(20, 184, 166, 0.25)',
    		},
    		fontFamily: {
    			sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
    			mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
