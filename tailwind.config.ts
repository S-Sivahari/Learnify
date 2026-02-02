import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // UNIFIED BRAND THEME - Corrected (Lime & Purple)
        neon: {
          DEFAULT: '#DAFD78',
          300: '#DAFD78',
        },
        cosmic: {
          DEFAULT: '#000000',
          500: '#171923',
          600: '#000000',
        },
        purple: {
          DEFAULT: '#6C5BA6',
          dark: '#423866',
        },
        gold: {
          DEFAULT: '#DAFD78',
        },
        pink: {
          DEFAULT: '#6C5BA6',
        },
        deepblack: '#000000',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#000000',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#DAFD78',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#6C5BA6',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#171923',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#171923',
          foreground: '#FFFFFF',
        },
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, #0C0E17 0%, #171B21 50%, #0C0E17 100%)',
        'gradient-accent': 'linear-gradient(135deg, #DAFD78 0%, #3FB950 100%)',
        'gradient-neon': 'linear-gradient(135deg, #DAFD78 0%, #6C5BA6 100%)',
        'gradient-purple': 'linear-gradient(135deg, #6C5BA6 0%, #58A6FF 100%)',
        'gradient-aurora': 'radial-gradient(ellipse at bottom, #1B4332 0%, #0C0E17 100%)',
      },
      boxShadow: {
        'brutal': '6px 6px 0px rgba(0, 0, 0, 0.5)',
        'heavy': '5px 5px 0px rgba(0, 0, 0, 0.4)',
        'medium': '3px 3px 0px rgba(0, 0, 0, 0.3)',
        'subtle': '2px 2px 0px rgba(0, 0, 0, 0.2)',
        // Soft glow shadows for buttons
        'neon': '0 0 20px rgba(218, 253, 120, 0.3)',
        'neon-lg': '0 0 30px rgba(218, 253, 120, 0.4)',
        'purple-glow': '0 0 20px rgba(108, 91, 166, 0.3)',
        'cyan-glow': '0 0 20px rgba(88, 166, 255, 0.3)',
        'gold-brutal': '4px 4px 0px rgba(218, 253, 120, 0.2)',
        'pink-brutal': '4px 4px 0px rgba(108, 91, 166, 0.2)',
        'gold-heavy': '3px 3px 0px rgba(218, 253, 120, 0.15)',
        'pink-heavy': '3px 3px 0px rgba(108, 91, 166, 0.15)',
        'gold-medium': '2px 2px 0px rgba(218, 253, 120, 0.1)',
        'pink-medium': '2px 2px 0px rgba(108, 91, 166, 0.1)',
        'glow-primary': '0 4px 20px rgba(218, 253, 120, 0.25)',
        'glow-accent': '0 4px 20px rgba(108, 91, 166, 0.25)',
        'card-glow': '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
