/** @type {import('tailwindcss').Config} */
module.exports = {
    // Which files should Tailwind scan for classes
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",     // All files in app folder
      "./components/**/*.{js,ts,jsx,tsx,mdx}", // All files in components folder
    ],
    theme: {
      extend: {
        // We can add custom colors, fonts, etc. here later
        colors: {
          // Example: adding anime-themed colors
          'anime-primary': '#ff6b35',
          'anime-secondary': '#4a90e2',
        }
      },
    },
    plugins: [],
  }