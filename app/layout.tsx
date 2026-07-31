import type { Metadata } from "next";
import {
  Geist_Mono,
  IBM_Plex_Sans_Thai_Looped,
} from "next/font/google";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-ibm-plex-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Waranchai Pungwattananukul — Full-Stack Web Developer",
  description:
    "Portfolio of Waranchai Pungwattananukul, a Full-Stack Web Developer in Bangkok building reliable digital products.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSansThai.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
