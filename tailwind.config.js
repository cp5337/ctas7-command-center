/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        // Tesla-inspired palette
        tesla: {
          red: "#E31937",
          black: "#171A20",
          white: "#FFFFFF",
          gray: {
            50: "#F7F8FA",
            100: "#F4F4F4",
            200: "#E8E8E8",
            300: "#CCCCCC",
            400: "#999999",
            500: "#666666",
            600: "#4D4D4D",
            700: "#333333",
            800: "#1A1A1A",
            900: "#0D0D0D",
          },
        },
        // SpaceX-inspired palette
        spacex: {
          blue: "#005288",
          white: "#FFFFFF",
          black: "#000000",
          gray: "#A0A0A0",
        },
        // Apple-inspired palette
        apple: {
          blue: "#007AFF",
          green: "#34C759",
          indigo: "#5856D6",
          orange: "#FF9500",
          pink: "#FF2D92",
          purple: "#AF52DE",
          red: "#FF3B30",
          teal: "#5AC8FA",
          yellow: "#FFCC00",
          gray: {
            50: "#F2F2F7",
            100: "#E5E5EA",
            200: "#D1D1D6",
            300: "#C7C7CC",
            400: "#AEAEB2",
            500: "#8E8E93",
            600: "#636366",
            700: "#48484A",
            800: "#3A3A3C",
            900: "#1C1C1E",
          },
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        apple: "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
        tesla: "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
        spacex: "0 12px 48px 0 rgba(0, 0, 0, 0.18)",
        cyber: "0 0 20px rgba(34, 211, 238, 0.4)",
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        apple: "12px",
        tesla: "8px",
        spacex: "4px",
      },
    },
  },
  plugins: [],
};
