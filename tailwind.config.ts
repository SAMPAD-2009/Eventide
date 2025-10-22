
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'border-red-500',
    'data-[state=checked]:bg-red-500',
    'data-[state=checked]:text-white',
    'border-yellow-500',
    'data-[state=checked]:bg-yellow-500',
    'border-sky-500',
    'data-[state=checked]:bg-sky-500',
    'bg-personal-tag',
    'text-personal-tag-foreground',
    'border-personal-tag-foreground',
    'bg-work-tag',
    'text-work-tag-foreground',
    'border-work-tag-foreground',
    'bg-social-tag',
    'text-social-tag-foreground',
    'border-social-tag-foreground',
    'bg-health-tag',
    'text-health-tag-foreground',
    'border-health-tag-foreground',
    'bg-other-tag',
    'text-other-tag-foreground',
    'border-other-tag-foreground',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-inter)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        'personal-tag': {
          bg: 'hsl(var(--personal-tag-bg))',
          DEFAULT: 'hsl(var(--personal-tag-bg))',
          foreground: 'hsl(var(--personal-tag-fg))',
        },
        'work-tag': {
          bg: 'hsl(var(--work-tag-bg))',
          DEFAULT: 'hsl(var(--work-tag-bg))',
          foreground: 'hsl(var(--work-tag-fg))',
        },
        'social-tag': {
          bg: 'hsl(var(--social-tag-bg))',
          DEFAULT: 'hsl(var(--social-tag-bg))',
          foreground: 'hsl(var(--social-tag-fg))',
        },
        'health-tag': {
          bg: 'hsl(var(--health-tag-bg))',
          DEFAULT: 'hsl(var(--health-tag-bg))',
          foreground: 'hsl(var(--health-tag-fg))',
        },
        'other-tag': {
          bg: 'hsl(var(--other-tag-bg))',
          DEFAULT: 'hsl(var(--other-tag-bg))',
          foreground: 'hsl(var(--other-tag-fg))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
