import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";
import { localize } from "../lib/content/i18n";
import { getPublishedPortfolio } from "../lib/content/repository.server";
import { PortfolioClient } from "./components/portfolio/PortfolioClient";

const loadPublicPortfolio = cache(getPublishedPortfolio);

export async function generateMetadata(): Promise<Metadata> {
  const [requestHeaders, data] = await Promise.all([
    headers(),
    loadPublicPortfolio(),
  ]);
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const metadataLanguage = requestHeaders
    .get("accept-language")
    ?.toLowerCase()
    .startsWith("th")
    ? "th"
    : "en";
  const title = localize(data.settings.seoTitle, metadataLanguage);
  const description = localize(
    data.settings.seoDescription,
    metadataLanguage,
  );

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

export default async function Home() {
  const data = await loadPublicPortfolio();
  return <PortfolioClient data={data} liveData />;
}
