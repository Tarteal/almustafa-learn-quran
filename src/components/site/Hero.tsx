import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-mosque.jpg";
import { useI18n } from "@/i18n/I18nContext";

const Hero = () => {
  const { t } = useI18n();
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Silhouette of an elegant mosque at golden hour"
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 pattern-overlay opacity-[0.08]" />
      </div>

      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-emerald/30 blur-3xl animate-glow-pulse" />

      <div className="container relative z-10 pt-28 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 border border-gold/30 backdrop-blur-md px-4 py-1.5 mb-8 animate-fade-in-down">
            <Sparkles className="h-3.5 w-3.5 text-gold-light" />
            <span className="text-xs font-medium tracking-wider uppercase text-gold-light">
              {t("hero.badge")}
            </span>
          </div>

          <p className="font-arabic text-3xl md:text-4xl text-gold-light mb-4 animate-fade-in" style={{ animationDelay: "100ms", opacity: 0 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] text-background mb-6 animate-fade-in"
            style={{ animationDelay: "200ms", opacity: 0 }}
          >
            {t("hero.title.a")}{" "}
            <span className="text-gradient-gold italic">{t("hero.title.b")}</span>
          </h1>

          <p
            className="text-lg md:text-xl text-background/80 max-w-2xl mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "400ms", opacity: 0 }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="flex flex-wrap gap-4 animate-fade-in"
            style={{ animationDelay: "600ms", opacity: 0 }}
          >
            <Button variant="gold" size="xl" asChild>
              <a href="#pricing">
                {t("hero.cta.trial")} <ArrowRight className="h-5 w-5 rtl-flip" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="bg-white/5 backdrop-blur-md border-white/30 text-background hover:bg-white/10 hover:text-background"
              asChild
            >
              <a href="#courses">
                <PlayCircle className="h-5 w-5" /> {t("hero.cta.courses")}
              </a>
            </Button>
          </div>

          <div
            className="mt-16 grid grid-cols-3 gap-6 max-w-xl animate-fade-in"
            style={{ animationDelay: "800ms", opacity: 0 }}
          >
            {[
              { num: "5,000+", label: t("hero.stat.students") },
              { num: "120+", label: t("hero.stat.teachers") },
              { num: "45+", label: t("hero.stat.countries") },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl md:text-4xl text-gradient-gold font-semibold">
                  {s.num}
                </div>
                <div className="text-sm text-background/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
};

export default Hero;
