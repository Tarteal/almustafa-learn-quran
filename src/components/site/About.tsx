import SectionHeading from "./SectionHeading";
import quranImg from "@/assets/quran-about.jpg";
import { Award, Clock, Globe2, Heart } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const About = () => {
  const { t } = useI18n();
  const features = [
    { icon: Award, title: t("about.feat.scholars.t"), text: t("about.feat.scholars.d") },
    { icon: Clock, title: t("about.feat.flexible.t"), text: t("about.feat.flexible.d") },
    { icon: Globe2, title: t("about.feat.global.t"), text: t("about.feat.global.d") },
    { icon: Heart, title: t("about.feat.personal.t"), text: t("about.feat.personal.d") },
  ];

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="container relative">
        <SectionHeading
          eyebrow={t("about.eyebrow")}
          title={
            <>
              {t("about.title.a")}{" "}
              <em className="text-gradient-gold not-italic font-display">{t("about.title.b")}</em>{" "}
              {t("about.title.c")}
            </>
          }
          description={t("about.desc")}
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="relative arch-top overflow-hidden shadow-deep border-4 border-gold/30">
              <img
                src={quranImg}
                alt="Open Quran on a wooden rehal"
                className="w-full aspect-[4/5] object-cover"
                loading="lazy"
                width={1280}
                height={1280}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-4 md:-right-10 bg-card border border-gold/30 rounded-2xl px-6 py-5 shadow-elegant max-w-[220px]">
              <div className="font-arabic text-2xl text-primary mb-1">إقرأ</div>
              <div className="text-xs text-muted-foreground">
                "Read in the name of your Lord who created."
              </div>
            </div>
            <div className="absolute -top-6 -left-6 w-24 h-24 border-l-2 border-t-2 border-gold/60 rounded-tl-2xl" />
          </div>

          <div>
            <h3 className="font-display text-2xl md:text-3xl mb-4 text-foreground">{t("about.mission.title")}</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("about.mission.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("about.mission.p2")}</p>

            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group p-5 rounded-xl bg-card border border-border hover:border-gold/50 hover:shadow-card transition-smooth"
                >
                  <div className="h-11 w-11 rounded-lg gradient-emerald grid place-items-center mb-3 group-hover:scale-110 transition-bounce">
                    <f.icon className="h-5 w-5 text-gold-light" />
                  </div>
                  <h4 className="font-display text-lg text-foreground mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
