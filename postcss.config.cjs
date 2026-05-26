/** Used by `npm run dev:win` — Tailwind v3 PostCSS (no @tailwindcss/oxide). */
module.exports = {
  plugins: [require("tailwindcss-v3")("./tailwind.config.cjs"), require("autoprefixer")],
};
