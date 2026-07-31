import { PortfolioClient } from "./components/portfolio/PortfolioClient";
import { defaultPortfolio } from "../lib/content/default-portfolio";
import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Waranchai Pungwattananukul — Full-Stack Web Developer";
  const description =
    "Full-Stack Web Developer in Bangkok building reliable digital products, platforms, and business systems.";

  return {
    title,
    description,
    alternates: { canonical: origin },
    openGraph: {
      type: "website",
      url: origin,
      title,
      description,
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: `${title} portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function Home() {
  return <PortfolioClient data={defaultPortfolio} liveData />;
}
