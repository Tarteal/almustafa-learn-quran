import { useI18n } from "@/i18n/I18nContext";
import logo from "@/assets/path-to-quran-logo.png.asset.json";

const Footer = () => {
  const { t } = useI18n();
  const programs = [
    [t("courses.noorani.t"), "#courses"],
    [t("courses.reading.t"), "#courses"],
    [t("courses.tajweed.t"), "#courses"],
    [t("courses.hifz.t"), "#courses"],
    [t("courses.tafseer.t"), "#courses"],
  ];
  const academy = [
    [t("nav.about"), "#about"],
    [t("nav.pricing"), "#pricing"],
    [t("nav.blog"), "#blog"],
    [t("nav.contact"), "#contact"],
    [t("hero.cta.trial"), "#pricing"],
  ];

  return (
    <footer className="relative bg-emerald-deep text-background pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-10" />
      <div className="container relative">
        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-background/10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src={logo.url} alt="Path to Quran logo" width={512} height={256} loading="lazy" className="h-16 w-auto object-contain" />
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-md mb-5">
              {t("footer.tagline")}
            </p>
            <p className="font-arabic text-2xl text-gold-light/80">
              وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
            </p>
          </div>

          <div>
            <h4 className="font-display text-base mb-4 text-gold-light">{t("footer.programs")}</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              {programs.map(([l, h]) => (
                <li key={l}><a href={h} className="hover:text-gold-light transition-smooth">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4 text-gold-light">{t("footer.academy")}</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              {academy.map(([l, h]) => (
                <li key={l}><a href={h} className="hover:text-gold-light transition-smooth">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-background/50">
          <div>© {new Date().getFullYear()} Almustafa Quran Academy. {t("footer.rights")}</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-light transition-smooth">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-gold-light transition-smooth">{t("footer.terms")}</a>
            <a href="#" className="hover:text-gold-light transition-smooth">{t("footer.refund")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
