// This imports the global CSS file (styles apply everywhere)
import "./globals.css";

// Metadata exports control what appears in browser tabs and SEO
export const metadata = {
  title: "Anime Music Quiz",     // Browser tab title
  description: "Guess anime songs with friends!", // SEO description
};

// RootLayout wraps EVERY page in your app
// The {children} prop is whatever page is being rendered
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}  {/* This is where page.js content goes */}
      </body>
    </html>
  );
}