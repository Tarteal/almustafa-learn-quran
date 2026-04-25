import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown>;
}

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => k !== "content" && el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute("content", attrs.content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const SEO = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  publishedTime,
  author,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    if (image) upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    if (publishedTime)
      upsertMeta('meta[property="article:published_time"]', {
        property: "article:published_time",
        content: publishedTime,
      });
    if (author) upsertMeta('meta[name="author"]', { name: "author", content: author });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

    upsertLink("canonical", canonical || window.location.href);

    // JSON-LD
    let script = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld="true"]');
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, image, type, publishedTime, author, JSON.stringify(jsonLd)]);

  return null;
};

export default SEO;
