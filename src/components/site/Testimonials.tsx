import SectionHeading from "./SectionHeading";
import { Star, Quote } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const reviews = [
  {
    name: "Aisha Rahman",
    role: "Parent · United Kingdom",
    text: "My two children have been learning with Almustafa for over a year. The teachers are incredibly patient, and their Tajweed has improved beyond what I imagined. May Allah reward them.",
    rating: 5,
    initial: "A",
  },
  {
    name: "Yusuf Ibrahim",
    role: "Hifz Student · Canada",
    text: "I started memorizing at 32, thinking it was too late. My Hafiz teacher's structured plan and gentle encouragement made it possible. Alhamdulillah, I'm now in Juz 18.",
    rating: 5,
    initial: "Y",
  },
  {
    name: "Fatima Al-Zahra",
    role: "Tafseer Student · Australia",
    text: "The Tafseer course completely changed how I read the Quran. I no longer just recite — I understand. Sheikh's explanations are clear, deep, and rooted in classical scholarship.",
    rating: 5,
    initial: "F",
  },
];

const Testimonials = () => {
  const { t } = useI18n();
  return (
    <section className="relative py-24 md:py-32 bg-secondary/40">
      <div className="container relative">
        <SectionHeading
          eyebrow={t("test.eyebrow")}
          title={
            <>
              {t("test.title.a")}{" "}
              <em className="text-gradient-gold not-italic font-display">{t("test.title.b")}</em>{" "}
              {t("test.title.c")}
            </>
          }
          description={t("test.desc")}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="relative bg-card rounded-2xl p-8 border border-border hover:border-gold/40 hover:shadow-elegant transition-smooth"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gold/20" />

              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              <p className="text-foreground/85 leading-relaxed mb-6 italic">"{r.text}"</p>

              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className="h-12 w-12 rounded-full gradient-emerald grid place-items-center text-gold font-display text-xl">
                  {r.initial}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
