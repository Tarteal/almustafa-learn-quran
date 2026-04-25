import SectionHeading from "./SectionHeading";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { posts } from "@/data/posts";

const Blog = () => {
  const { t } = useI18n();
  return (
    <section id="blog" className="relative py-24 md:py-32">
      <div className="container relative">
        <SectionHeading
          eyebrow={t("blog.eyebrow")}
          title={
            <>
              {t("blog.title.a")}{" "}
              <em className="text-gradient-gold not-italic font-display">{t("blog.title.b")}</em>
            </>
          }
          description={t("blog.desc")}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-gold/40 hover:shadow-elegant transition-smooth hover:-translate-y-1"
            >
              <div className={`relative h-48 bg-gradient-to-br ${p.gradient} overflow-hidden`}>
                <div className="absolute inset-0 pattern-overlay opacity-30" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/95 text-xs font-semibold text-primary uppercase tracking-wider">
                  {p.cat}
                </div>
                <div className="absolute bottom-4 left-4 font-arabic text-5xl text-background/30">﷽</div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {p.dateLabel}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {p.readTime}</span>
                </div>
                <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-primary transition-smooth">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{p.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-smooth">
                  {t("blog.read")} <ArrowUpRight className="h-4 w-4 rtl-flip" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
