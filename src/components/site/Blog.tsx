import SectionHeading from "./SectionHeading";
import { ArrowUpRight, Calendar } from "lucide-react";

const posts = [
  {
    cat: "Tajweed",
    date: "Apr 12, 2026",
    title: "5 Common Mistakes in Madd — and How to Fix Them",
    excerpt: "Lengthening (Madd) is one of the most beautiful aspects of Tajweed, but it's easy to overlook the subtleties. Here's how to perfect yours.",
    gradient: "from-emerald-deep to-emerald",
  },
  {
    cat: "Hifz",
    date: "Apr 5, 2026",
    title: "How to Memorize Quran While Working Full-Time",
    excerpt: "A practical guide to building a sustainable Hifz routine alongside your career, with sample weekly schedules.",
    gradient: "from-gold-deep to-gold",
  },
  {
    cat: "Parenting",
    date: "Mar 28, 2026",
    title: "Raising Quran-Loving Kids: A Parent's Roadmap",
    excerpt: "From age 4 to 14 — practical milestones, dua suggestions, and gentle techniques that work in modern households.",
    gradient: "from-emerald to-gold-deep",
  },
];

const Blog = () => {
  return (
    <section id="blog" className="relative py-24 md:py-32">
      <div className="container relative">
        <SectionHeading
          eyebrow="From the Blog"
          title={<>Wisdom & guidance for the <em className="text-gradient-gold not-italic font-display">seeker</em></>}
          description="Articles on Quran learning, Islamic parenting, and spiritual growth — written by our scholars."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article
              key={p.title}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-gold/40 hover:shadow-elegant transition-smooth hover:-translate-y-1"
            >
              <div className={`relative h-48 bg-gradient-to-br ${p.gradient} overflow-hidden`}>
                <div className="absolute inset-0 pattern-overlay opacity-30" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/95 text-xs font-semibold text-primary uppercase tracking-wider">
                  {p.cat}
                </div>
                <div className="absolute bottom-4 left-4 font-arabic text-5xl text-background/30">
                  ﷽
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" /> {p.date}
                </div>
                <h3 className="font-display text-xl text-foreground mb-3 group-hover:text-primary transition-smooth">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.excerpt}</p>
                <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-smooth">
                  Read article <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
