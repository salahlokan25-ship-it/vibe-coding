/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Inter', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			colors: {
				vibe: {
					bg: {
						primary: '#0B0F19',
						secondary: '#111827',
						tertiary: '#161B22',
						card: '#0f172a',
						hover: '#1e293b'
					},
					accent: {
						orange: '#FF5C00',
						'orange-light': '#FF7A2F',
						'orange-dark': '#E04E00',
						'orange-glow': 'rgba(255,92,0,0.4)',
						blue: '#3B82F6',
						indigo: '#6366F1',
						purple: '#A855F7',
						cyan: '#06B6D4',
						glow: 'rgba(255,92,0,0.5)'
					},
					border: {
						subtle: '#1e293b',
						default: '#2a3548',
						focus: '#FF5C00'
					},
					text: {
						primary: '#f1f5f9',
						secondary: '#94a3b8',
						muted: '#64748b',
						accent: '#FF5C00'
					}
				},
				border: 'hsl(var(--border))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			backgroundImage: {
				'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,92,0,0.12) 0%, transparent 60%)',
				'card-gradient': 'linear-gradient(135deg, rgba(255,92,0,0.05) 0%, transparent 100%)',
				'button-gradient': 'linear-gradient(135deg, #FF5C00 0%, #FF7A2F 100%)',
				'glow-gradient': 'radial-gradient(circle, rgba(255,92,0,0.12) 0%, transparent 70%)'
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'slide-in-right': 'slideInRight 0.4s ease-out',
				'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
				'spin-slow': 'spin 3s linear infinite',
				'mesh-spin': 'meshSpin 20s linear infinite',
				float: 'float 6s ease-in-out infinite',
				'float-delayed': 'float 6s ease-in-out 3s infinite',
				shimmer: 'shimmer 2s linear infinite',
				blink: 'blink 1s step-end infinite'
			},
			keyframes: {
				meshSpin: {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'50%': { transform: 'rotate(180deg) scale(1.1)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				slideInRight: {
					from: { opacity: '0', transform: 'translateX(20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				pulseGlow: {
					'0%, 100%': { boxShadow: '0 0 20px rgba(255,92,0,0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(255,92,0,0.6)' }
				},
				shimmer: {
					from: { backgroundPosition: '-200% 0' },
					to: { backgroundPosition: '200% 0' }
				},
				blink: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				}
			},
			boxShadow: {
				'glow-blue': '0 0 30px rgba(59,130,246,0.3)',
				'glow-indigo': '0 0 30px rgba(99,102,241,0.3)',
				'glow-orange': '0 0 30px rgba(255,92,0,0.4)',
				card: '0 4px 24px rgba(0,0,0,0.4)',
				'inner-subtle': 'inset 0 1px 0 rgba(255,255,255,0.04)'
			},
			backdropBlur: {
				xs: '2px'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
