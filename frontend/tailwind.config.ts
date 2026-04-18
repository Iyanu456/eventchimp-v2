import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#8828D2",
          soft: "#F3E8FE",
          muted: "#C58AF5",
          deep: "#5A188A"
        },
        violet: {
          DEFAULT: "#8828D2",
          strong: "#2F063F",
          deep: "#4F1578",
          soft: "#F7F0FE"
        },
        ink: "#171224",
        muted: "#8B8499",
        line: "#ECE8F3",
        surface: "#F4F4F6",
        "surface-subtle": "#FAF8FD",
        panel: "#FFFFFF",
        "panel-strong": "#F6F4FA",
        success: "#3CBF9A",
        warning: "#F2B059",
        danger: "#B42318"
      },
      boxShadow: {
        soft: "0 10px 28px rgba(34, 18, 60, 0.06)",
        lift: "0 26px 60px rgba(48, 11, 75, 0.12)",
        hero: "0 32px 80px rgba(44, 8, 70, 0.18)",
        halo: "0 0 0 1px rgba(136, 40, 210, 0.08), 0 16px 40px rgba(136, 40, 210, 0.16)"
      },
      backgroundImage: {
        "dash-surface":
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 100%)",
        "public-fade":
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,240,254,0.75) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
