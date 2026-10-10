import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://denbooks.in"),
  title: "DenBooks — Operating Suite for Citizen Service Centers",
  description: "All-in-one accounts manager, portal wallet tracker, thermal POS billing, and cash drawer reconciliation for CSC, Cyber Cafés, and Akshaya Centers.",
  keywords: [
    "DenBooks",
    "Akshaya center software",
    "CSC Digital Seva billing",
    "Cyber Cafe POS",
    "Citizen Service Center",
    "e-District Kerala daybook",
    "Thermal receipt printer software",
  ],
  openGraph: {
    title: "DenBooks — Operating Suite for Citizen Service Centers",
    description: "All-in-one accounts manager, portal wallet tracker, thermal POS billing, and cash drawer reconciliation for CSC, Cyber Cafés, and Akshaya Centers.",
    url: "https://denbooks.in",
    siteName: "DenBooks",
    images: [
      {
        url: "/brand-poster.png",
        width: 1200,
        height: 630,
        alt: "DenBooks Official Operating Suite",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DenBooks — Operating Suite for Citizen Service Centers",
    description: "All-in-one accounts manager, portal wallet tracker, thermal POS billing, and cash drawer reconciliation for CSC, Cyber Cafés, and Akshaya Centers.",
    images: ["/brand-poster.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('denbooks_theme') || localStorage.getItem('denbooks_landing_theme') || 'dark';
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(saved);
                  document.documentElement.setAttribute('data-theme', saved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-150">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
