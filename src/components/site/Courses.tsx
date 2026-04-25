import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, Mic, Brain, ScrollText, ArrowRight, Clock, Signal } from "lucide-react";

const courses = [
  {
    icon: BookOpen,
    title: "Noorani Qaida",
    desc: "Master Arabic letters, pronunciation, and basic rules — the foundation for every Quran reader.",
    duration: "2–4 months",
    level: "Beginner",
    color: "from-emerald-deep to-emerald",
  },
  {
    icon: BookMarked,
    title: "Quran Reading (Nazra)",
    desc: "Learn to read the Quran fluently with correct pronunciation, building confidence verse by verse.",
    duration: "6–12 months",
    level: "Beginner",
    color: "from-emerald to-emerald-soft",
  },
  {
    icon: Mic,
    title: "Tajweed Course",
    desc: "Perfect the rules of recitation — Madd, Ghunna, Idgham, and more — for beautiful, accurate reading.",
    duration: "8–14 months",
    level: "Intermediate",
    color: "from-gold-deep to-gold",
  },
  {
    icon: Brain,
    title: "Hifz Program",
    desc: "Memorize the entire Quran with our structured plan, daily revision, and dedicated Hafiz mentors.",
    duration: "3–5 years",
    level: "Advanced",
    color: "from-emerald-deep to-gold-deep",
  },
  {
    icon: ScrollText,
    title: "Tafseer Course",
    desc: "Understand the meaning, context, and lessons of the Quran with classical and contemporary scholarship.",
    duration: "12+ months",
    level: "Advanced",
    color: "from-gold to-gold-light",
  },
];

const Courses = () => {
  return (
    <section id="courses" className="relative py-24 md:py-32 bg-secondary/40">
      <div className="container relative">
        <SectionHeading
          eyebrow="Our Courses"
          title={<>A path for <em className="text-gradient-gold not-italic font-display">every</em> stage of your journey</>}
          description="From your very first letter to mastering Tafseer — choose the program that meets you where you are."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c, i) => (
            <article
              key={c.title}
              className="group relative bg-card rounded-2xl p-7 border border-border hover:border-gold/50 transition-smooth hover:-translate-y-2 hover:shadow-elegant overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Gradient corner */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${c.color} opacity-10 blur-2xl group-hover:opacity-30 transition-smooth`} />

              <div className={`relative h-14 w-14 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center mb-5 shadow-card group-hover:scale-110 group-hover:rotate-3 transition-bounce`}>
                <c.icon className="h-7 w-7 text-background" />
              </div>

              <h3 className="font-display text-2xl text-foreground mb-3">{c.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{c.desc}</p>

              <div className="flex items-center gap-4 text-xs mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-gold-deep" /> {c.duration}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Signal className="h-3.5 w-3.5 text-gold-deep" /> {c.level}
                </div>
              </div>

              <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:bg-transparent" asChild>
                <a href="#pricing">
                  Enroll Now
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-smooth" />
                </a>
              </Button>
            </article>
          ))}

          {/* CTA card */}
          <article className="relative rounded-2xl p-8 gradient-emerald text-background overflow-hidden flex flex-col justify-between min-h-[260px]">
            <div className="absolute inset-0 pattern-overlay opacity-20" />
            <div className="relative">
              <p className="font-arabic text-2xl text-gold-light mb-2">طَلَبُ الْعِلْمِ فَرِيضَةٌ</p>
              <h3 className="font-display text-2xl mb-2">Not sure where to start?</h3>
              <p className="text-background/80 text-sm">Book a free assessment with one of our scholars.</p>
            </div>
            <Button variant="gold" className="relative w-fit mt-6" asChild>
              <a href="#contact">Talk to a Scholar <ArrowRight className="h-4 w-4" /></a>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Courses;
