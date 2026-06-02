import { useEffect, useState } from "react";
import { Moon, BookOpen } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const hadiths = [
  {
    arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
    text: "Read in the name of your Lord who created.",
    source: "Surah Al-Alaq 96:1",
  },
];

const HadithStrip = () => {
  const { t, lang } = useI18n();
  const [index, setIndex] = useState(0);
  const [hijri, setHijri] = useState<string>("");

  useEffect(() => {
    setIndex(Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % hadiths.length);
    try {
      const localeMap: Record<string, string> = {
        en: "en-TN-u-ca-islamic",
        ur: "ur-PK-u-ca-islamic",
        ar: "ar-SA-u-ca-islamic",
      };
      const fmt = new Intl.DateTimeFormat(localeMap[lang] || "en-TN-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setHijri(fmt.format(new Date()));
    } catch {
      setHijri("");
    }
  }, [lang]);

  const h = hadiths[index];

  return (
    <section className="relative py-12 gradient-emerald text-background overflow-hidden border-y border-gold/20">
      <div className="absolute inset-0 pattern-overlay opacity-15" />
      <div className="container relative grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 flex items-start gap-4">
          <div className="h-11 w-11 rounded-lg bg-gold/15 border border-gold/30 grid place-items-center shrink-0">
            <BookOpen className="h-5 w-5 text-gold-light" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold-light mb-1.5">{t("hadith.eyebrow")}</div>
            <p className="font-arabic text-2xl md:text-3xl text-gold-light leading-loose mb-2" dir="rtl">
              {h.arabic}
            </p>
            <p className="text-background/95 italic font-display text-lg md:text-xl leading-snug">
              "{h.text}"
            </p>
            <div className="text-xs text-background/60 mt-2">— {h.source}</div>
          </div>
        </div>

        {hijri && (
          <div className="md:border-l md:border-gold/20 md:pl-8 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-gold/15 border border-gold/30 grid place-items-center shrink-0">
              <Moon className="h-5 w-5 text-gold-light" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold-light mb-1">{t("hadith.hijri")}</div>
              <div className="font-display text-lg text-background">{hijri}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HadithStrip;
