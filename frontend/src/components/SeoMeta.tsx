import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type RouteSeo = {
  title: string;
  description: string;
  keywords: string;
};

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://protobytes-2-0-team-forsaken.vercel.app"
).replace(/\/$/, "");
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-thumbnail.png`;

const ROUTE_SEO: Record<string, RouteSeo> = {
  "/": {
    title: "VoiceLink | Cloud SMS & Voice Messaging Platform for SMEs",
    description:
      "VoiceLink is a cloud-based communication platform that makes bulk SMS and voice messaging simple and affordable for SMEs.",
    keywords:
      "cloud communication platform, bulk SMS platform, voice messaging platform, communication platform for SMEs, SMS campaign software, multilingual messaging",
  },
  "/features": {
    title: "VoiceLink Features | Scheduling, Analytics & Contact Management",
    description:
      "Explore VoiceLink features including campaign scheduling, analytics, contact management, multilingual messaging, and voice broadcasting.",
    keywords:
      "SMS scheduling, campaign analytics, contact management software, voice broadcast tools, multilingual messaging, SME communication tools",
  },
  "/pricing": {
    title: "VoiceLink Pricing | Affordable Bulk SMS & Voice Plans for SMEs",
    description:
      "Compare affordable VoiceLink plans for bulk SMS and voice messaging with flexible options for growing SMEs.",
    keywords:
      "bulk SMS pricing, voice messaging pricing, SME messaging plans, communication platform pricing, campaign software cost",
  },
  "/why-us": {
    title: "Why VoiceLink | Reliable, Scalable Messaging for SMEs",
    description:
      "Learn why SMEs choose VoiceLink for reliable delivery, secure infrastructure, and easy campaign management without technical complexity.",
    keywords:
      "reliable SMS gateway, secure voice platform, SME messaging software, easy communication platform, trusted bulk messaging provider",
  },
  "/contact": {
    title: "Contact VoiceLink | Talk to Our Team",
    description:
      "Contact VoiceLink for demos, onboarding help, and support for bulk SMS and voice messaging campaigns.",
    keywords:
      "contact voicelink, SME communication support, bulk SMS consultation, voice messaging support",
  },
  "/team": {
    title: "VoiceLink Team | Builders of the SME Communication Platform",
    description:
      "Meet the team building VoiceLink, the cloud-based communication platform for SMEs with bulk SMS, voice messaging, scheduling, analytics, and contact management.",
    keywords:
      "voicelink team, SME communication platform team, bulk SMS platform builders, voice messaging platform developers",
  },
};

const setMeta = (name: string, content: string, property = false) => {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    if (property) {
      tag.setAttribute("property", name);
    } else {
      tag.setAttribute("name", name);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const setCanonical = (url: string) => {
  let link = document.head.querySelector("link[rel=\"canonical\"]") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
};

const upsertJsonLd = (id: string, json: object) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(json);
};

const ROUTE_NAMES: Record<string, string> = {
  "/": "Home",
  "/features": "Features",
  "/pricing": "Pricing",
  "/why-us": "Why Us",
  "/contact": "Contact",
  "/team": "Team",
};

const SeoMeta = () => {
  const { pathname } = useLocation();
  const seo = ROUTE_SEO[pathname] ?? ROUTE_SEO["/"];
  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  useEffect(() => {
    document.title = seo.title;
    setCanonical(canonicalUrl);

    setMeta("description", seo.description);
    setMeta("keywords", seo.keywords);
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    setMeta("og:title", seo.title, true);
    setMeta("og:description", seo.description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:image", DEFAULT_OG_IMAGE, true);
    setMeta("og:site_name", "VoiceLink", true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", seo.title);
    setMeta("twitter:description", seo.description);
    setMeta("twitter:image", DEFAULT_OG_IMAGE);

    upsertJsonLd("ld-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "VoiceLink",
      url: SITE_URL,
      inLanguage: ["en", "ne"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    upsertJsonLd("ld-organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "VoiceLink",
      url: SITE_URL,
      logo: `${SITE_URL}/voicelink-logo.svg`,
      sameAs: ["https://www.dhirendrasinghdhami.com.np/"],
    });

    upsertJsonLd("ld-service", {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "VoiceLink Cloud Communication Service",
      provider: {
        "@type": "Organization",
        name: "VoiceLink",
      },
      serviceType: "Bulk SMS, voice messaging, campaign scheduling, analytics, and contact management for SMEs",
      url: canonicalUrl,
    });

    upsertJsonLd("ld-webpage", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: ROUTE_NAMES[pathname] ?? "VoiceLink",
      url: canonicalUrl,
      description: seo.description,
      isPartOf: {
        "@type": "WebSite",
        name: "VoiceLink",
        url: SITE_URL,
      },
    });

    upsertJsonLd("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement:
        pathname === "/"
          ? [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
            ]
          : [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: ROUTE_NAMES[pathname] ?? "Page",
                item: canonicalUrl,
              },
            ],
    });
  }, [canonicalUrl, pathname, seo]);

  return null;
};

export default SeoMeta;
