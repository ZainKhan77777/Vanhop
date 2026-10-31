import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme=\"never-dark\"]"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0E1626", 800: "#141F35", 700: "#22304F" },
        brass: { DEFAULT: "#A8761F", light: "#D8B071", tint: "#F6EEDF" },
        surface: { DEFAULT: "#FFFFFF", 2: "#F5F7FB" },
        line: { DEFAULT: "#EAEEF5", 2: "#D5DCE8" },
        muted: "#64728C",
        rose: "#A33C3C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: { xl2: "18px" },
      boxShadow: {
        sm2: "0 1px 2px rgba(14,22,38,.04), 0 3px 12px rgba(14,22,38,.04)",
        md2: "0 2px 6px rgba(14,22,38,.05), 0 20px 44px rgba(14,22,38,.09)",
      },
      transitionTimingFunction: { soft: "cubic-bezier(.22,.9,.3,1)" },
      keyframes: {
        lift: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        kenburns: { from: { transform: "scale(1.06)" }, to: { transform: "scale(1)" } },
        lamp: { "0%,100%": { fill: "#F5A524" }, "50%": { fill: "#E8EDF6" } },
        wave: { "0%": { opacity: "0", transform: "translateX(-6px)" }, "35%": { opacity: "1" }, "100%": { opacity: "0", transform: "translateX(10px)" } },
        ring: { from: { transform: "scale(1)", opacity: ".7" }, to: { transform: "scale(1.07)", opacity: "0" } },
        settle: { "0%,100%": { transform: "translateY(0)" }, "28%": { transform: "translateY(-5px)" }, "58%": { transform: "translateY(2px)" } },
        shake: { "0%,100%": { transform: "translateX(0)" }, "20%": { transform: "translateX(-7px)" }, "40%": { transform: "translateX(6px)" }, "60%": { transform: "translateX(-4px)" }, "80%": { transform: "translateX(3px)" } },
      },
      animation: {
        lift: "lift .6s cubic-bezier(.22,.9,.3,1) both",
        fade: "fade .4s cubic-bezier(.22,.9,.3,1) both",
        kenburns: "kenburns 14s cubic-bezier(.22,.9,.3,1) both",
        settle: "settle .62s cubic-bezier(.22,.9,.3,1)",
        shake: "shake .4s cubic-bezier(.22,.9,.3,1)",
        ring: "ring .9s cubic-bezier(.22,.9,.3,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
