import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { BookOpen, BookMarked, Mic, Brain, ScrollText, ArrowRight, Clock, Signal } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const Courses = () => {
  const { t } = useI18n();
  const courses = [
    { icon: BookOpen, title: t("courses.noorani.t"), desc: t("courses.noorani.d"), duration: "2–4 mo", level: t("courses.level.beginner"), color: "from-emerald-deep to-emerald" },
    { icon: BookMarked, title: t("courses.reading.t"), desc: t("courses.reading.d"), duration: "6–12 mo", level: t("courses.level.beginner"), color: "from-emerald to-emerald-soft" },
    { icon: Mic, title: t("courses.tajweed.t"), desc: t("courses.tajweed.d"), duration: "8–14 mo", level: t("courses.level.intermediate"), color: "from-gold-deep to-gold" },
    { icon: Brain, title: t("courses.hifz.t"), desc: t("courses.hifz.d"), duration: "3–5 yr", level: t("courses.level.advanced"), color: "from-emerald-deep to-gold-deep" },
    { icon: ScrollText, title: t("courses.tafseer.t"), desc: t("courses.tafseer.d"), duration: "12+ mo", level: t("courses.level.advanced"), color: "from-gold to-gold-light" },
  ];

  return (
    <section id="courses" className="relative py-24 md:py-32 bg-secondary/40">
      <div className="container relative">
        <SectionHeading
          eyebrow={t("courses.eyebrow")}
          title={
            <>
              {t("courses.title.a")}{" "}
              <em className="text-gradient-gold not-italic font-display">{t("courses.title.b")}</em>{" "}
              {t("courses.title.c")}
            </>
          }
          description={t("courses.desc")}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <article
              key={c.title}
              className="group relative bg-card rounded-2xl p-7 border border-border hover:border-gold/50 transition-smooth hover:-translate-y-2 hover:shadow-elegant overflow-hidden"
            >
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
                  {t("courses.enroll")}
                  <ArrowRight className="h-4 w-4 rtl-flip group-hover/btn:translate-x-1 transition-smooth" />
                </a>
              </Button>
            </article>
          ))}

          <article className="relative rounded-2xl p-8 gradient-emerald text-background overflow-hidden flex flex-col justify-between min-h-[260px]">
            <div className="absolute inset-0 pattern-overlay opacity-20" />
            <div className="relative">
              <p className="font-arabic text-2xl text-gold-light mb-2">طَلَبُ الْعِلْمِ فَرِيضَةٌ</p>
              <h3 className="font-display text-2xl mb-2">{t("courses.cta.title")}</h3>
              <p className="text-background/80 text-sm">{t("courses.cta.desc")}</p>
            </div>
            <Button variant="gold" className="relative w-fit mt-6" asChild>
              <a href="#contact">{t("courses.cta.btn")} <ArrowRight className="h-4 w-4 rtl-flip" /></a>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Courses;
