import { useEffect, useState } from "react";
import { Moon, BookOpen } from "lucide-react";

const hadiths = [
  { text: "The best of you are those who learn the Quran and teach it.", source: "Sahih al-Bukhari" },
  { text: "Whoever recites a letter from the Book of Allah, he will receive a hasanah.", source: "At-Tirmidhi" },
  { text: "The example of a believer who recites the Quran is like a citron — its taste is good and its smell is good.", source: "Sahih al-Bukhari" },
  { text: "Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection.", source: "Sahih Muslim" },
];

const HadithStrip = () => {
  const [index, setIndex] = useState(0);
  const [hijri, setHijri] = useState<string>("");

  useEffect(() => {
    setIndex(Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % hadiths.length);
    try {
      const fmt = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setHijri(fmt.format(new Date()).replace(" AH", "") + " AH");
    } catch {
      setHijri("");
    }
  }, []);

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
            <div className="text-xs uppercase tracking-[0.3em] text-gold-light mb-1.5">Hadith of the Day</div>
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
              <div className="text-xs uppercase tracking-[0.3em] text-gold-light mb-1">Today (Hijri)</div>
              <div className="font-display text-lg text-background">{hijri}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HadithStrip;
