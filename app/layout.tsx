import type { Metadata } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "waranchai-portfolio.newforico-9ea.workers.dev";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "Waranchai Pungwattananukul — Full-Stack Web Developer",
    description:
      "Portfolio of Waranchai Pungwattananukul, a Full-Stack Web Developer in Bangkok building reliable digital products.",
    openGraph: {
      type: "website",
      title: "Waranchai Pungwattananukul — Full-Stack Web Developer",
      description:
        "Portfolio of Waranchai Pungwattananukul, a Full-Stack Web Developer in Bangkok building reliable digital products.",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
    },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
  };
}

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
