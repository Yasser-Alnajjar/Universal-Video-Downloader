import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Download, CheckCircle, Smartphone } from "lucide-react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaPinterest,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToggleTheme } from "@/components/ui/toggle-theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Veluxa Downloader",
    default: "Veluxa Downloader",
  },
  description:
    "Download videos from YouTube, Twitter, Instagram, Facebook, and Pinterest for free. High quality MP4 downloads, fast and unlimited.",
  keywords: [
    "video downloader",
    "youtube downloader",
    "twitter downloader",
    "instagram downloader",
    "facebook downloader",
    "pinterest downloader",
    "download video mp4",
  ],
  authors: [{ name: "Yasser AlNajjar" }],
  openGraph: {
    title: "Veluxa Downloader",
    description:
      "Modern and fast video downloader for all your favorite platforms.",
    type: "website",
    url: "https://veluxa-downloader.vercel.app",
    siteName: "Veluxa Downloader",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veluxa Downloader",
    description: "Multi-platform video downloader. Fast, free, and easy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const platforms = [
    {
      name: "Twitter / X",
      icon: FaTwitter,
      color: "text-blue-400",
      path: "/twitter",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      color: "text-pink-500",
      path: "/instagram",
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "text-blue-600",
      path: "/facebook",
    },
    {
      name: "Pinterest",
      icon: FaPinterest,
      color: "text-red-600",
      path: "/",
    },
  ];
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2"
                aria-label="Veluxa Home"
              >
                <div className="bg-primary p-1.5 rounded-full">
                  <Download className="h-5 w-5 text-white" strokeWidth={3} />
                </div>
                <span className="font-bold text-lg tracking-tight">Veluxa</span>
              </Link>
              <div className="flex items-center space-x-4">
                <ToggleTheme />
              </div>
            </div>
          </nav>
          <main className="bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Hero Section */}
            <div className="flex-1 w-full flex flex-col items-center pt-20 pb-16 px-4 relative overflow-hidden">
              {children}
            </div>
            {/* Platforms Grid */}
            <section className="bg-white dark:bg-slate-950 py-16 border-y border-slate-100 dark:border-slate-800/50">
              <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold mb-10 text-slate-800 dark:text-slate-200">
                  Supported Platforms
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {platforms.map((p) => (
                    <Link
                      key={p.name}
                      href={p.path}
                      aria-label={`Download from ${p.name}`}
                      className="cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:-translate-y-1 group cursor-default"
                    >
                      <p.icon
                        className={`h-10 w-10 mb-3 ${p.color} transition-transform group-hover:scale-110`}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 relative">
                        {p.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-slate-50 dark:bg-slate-950 text-center">
              <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-12">
                <div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">High Quality</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    We extract the best available resolution, up to 4K where
                    supported.
                  </p>
                </div>
                <div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                    <Download className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Fast & Free</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    No registration required. Unlimited downloads at lightning
                    speed.
                  </p>
                </div>
                <div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                    <Smartphone className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mobile Friendly</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Responsive design works perfectly on iPhone, Android, and
                    tablets.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-950 border-t py-12 text-center text-slate-500 text-sm">
              <p>© {new Date().getFullYear()} Veluxa.</p>
              <p>
                Created by{" "}
                <a
                  href="https://github.com/Yasser-Alnajjar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline underline-offset-4 transition-colors"
                >
                  Yasser AlNajjar
                </a>
              </p>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
