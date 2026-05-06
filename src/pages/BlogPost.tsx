import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, Facebook, Link2, Twitter, Linkedin, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { getPostBySlug, getRelatedPosts, type Block } from "@/data/posts";

const renderBlock = (b: Block, i: number) => {
  switch (b.type) {
    case "h2":
      return (
        <h2 key={i} className="font-display text-3xl md:text-4xl text-foreground mt-12 mb-5">
          {b.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="font-display text-2xl text-foreground mt-8 mb-4">
          {b.text}
        </h3>
      );
    case "p":
      return (
        <p key={i} className="text-lg leading-relaxed text-foreground/85 mb-5">
          {b.text}
        </p>
      );
    case "list":
      return (
        <ul key={i} className="space-y-3 mb-6 ml-1">
          {b.items.map((item, j) => (
            <li key={j} className="flex gap-3 text-foreground/85 leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="my-8 border-l-4 border-gold pl-6 py-2 italic text-xl font-display text-foreground/90"
        >
          "{b.text}"
          {b.cite && <footer className="not-italic text-sm font-sans text-muted-foreground mt-2">— {b.cite}</footer>}
        </blockquote>
      );
    case "ayah":
      return (
        <div
          key={i}
          className="my-10 rounded-2xl gradient-emerald text-background p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pattern-overlay opacity-15" />
          <div className="relative">
            <p className="font-arabic text-3xl md:text-4xl text-gold-light leading-relaxed mb-4">
              {b.arabic}
            </p>
            <p className="text-background/90 italic mb-2">"{b.translation}"</p>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-light">{b.ref}</p>
          </div>
        </div>
      );
  }
};

const ShareButtons = ({ title, url }: { title: string; url: string }) => {
  const [copied, setCopied] = useState(false);
  const enc = (s: string) => encodeURIComponent(s);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const links = [
    { label: "Twitter", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">Share</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label}`}
          className="h-9 w-9 rounded-full border border-border hover:border-gold/60 hover:bg-gold/10 grid place-items-center text-foreground/70 hover:text-foreground transition-smooth"
        >
          <l.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={onCopy}
        aria-label="Copy link"
        className="h-9 w-9 rounded-full border border-border hover:border-gold/60 hover:bg-gold/10 grid place-items-center text-foreground/70 hover:text-foreground transition-smooth"
      >
        {copied ? <Check className="h-4 w-4 text-emerald" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/404" replace />;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const related = getRelatedPosts(post.slug, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: "Almustafa Quran Academy",
    },
    articleSection: post.cat,
    inLanguage: "en",
  };

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title={`${post.title} — Almustafa Quran Academy`}
        description={post.excerpt}
        type="article"
        publishedTime={post.date}
        author={post.author.name}
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* Hero */}
      <header className={`relative pt-32 pb-16 bg-gradient-to-br ${post.gradient} text-background overflow-hidden`}>
        <div className="absolute inset-0 pattern-overlay opacity-15" />
        <div className="container relative">
          <Link
            to="/#blog"
            className="inline-flex items-center gap-2 text-sm text-background/80 hover:text-background mb-8 transition-smooth"
          >
            <ArrowLeft className="h-4 w-4 rtl-flip" /> Back to all articles
          </Link>

          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-background/15 backdrop-blur border border-background/25 text-xs font-semibold uppercase tracking-wider mb-5">
              {post.cat}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.1] mb-6">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-background/85 mb-8 max-w-2xl leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-background/80">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-background/15 border border-gold/40 grid place-items-center font-display text-gold-light">
                  {post.author.initial}
                </div>
                <div>
                  <div className="font-medium text-background">{post.author.name}</div>
                  <div className="text-xs text-background/60">{post.author.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>{post.dateLabel}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {post.readTime}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <article className="relative py-16 md:py-20">
        <div className="absolute inset-0 pattern-overlay opacity-30" />
        <div className="container relative max-w-3xl">
          {post.body.map(renderBlock)}

          {/* Share row */}
          <div className="mt-14 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <ShareButtons title={post.title} url={url} />
            <Button variant="outlineGold" size="sm" asChild>
              <Link to="/#contact">Talk to a Scholar</Link>
            </Button>
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="bg-secondary/40 py-20 border-t border-border">
        <div className="container">
          <div className="divider-ornament mb-4">
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-gold-deep">
              Continue reading
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-center text-foreground mb-12">
            Related <em className="text-gradient-gold not-italic">articles</em>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {related.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-gold/40 hover:shadow-elegant transition-smooth hover:-translate-y-1"
              >
                <div className={`relative h-40 bg-gradient-to-br ${p.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 pattern-overlay opacity-30" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/95 text-xs font-semibold text-primary uppercase tracking-wider">
                    {p.cat}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" /> {p.dateLabel} · {p.readTime}
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-smooth">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Read article <ArrowUpRight className="h-4 w-4 rtl-flip" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BlogPost;
