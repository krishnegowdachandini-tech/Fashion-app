/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        skin: {
          50:  "#FFF8F3",
          100: "#F5E6D8",
          200: "#E8C8A8",
          300: "#D4A574",
          400: "#C9956E",
          500: "#B8784A",
          600: "#9B5E33",
          700: "#7A4526",
          800: "#5C3019",
          900: "#3D1F0E",
        },
      },
    },
  },
  plugins: [],
};

