import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import LangSwitcher from "./LangSwitcher";

const Navbar = () => {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.courses"), href: "#courses" },
    { label: t("nav.pricing"), href: "#pricing" },
    { label: t("nav.blog"), href: "#blog" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-smooth ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 rounded-full gradient-emerald grid place-items-center shadow-elegant">
            <span className="font-arabic text-gold text-xl">ﷲ</span>
            <div className="absolute inset-0 rounded-full ring-1 ring-gold/40" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-foreground">Almustafa</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-gold-deep font-medium">Quran Academy</div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-smooth relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-smooth origin-left" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LangSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <a href="#contact">{t("nav.signin")}</a>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <a href="#pricing">{t("nav.trial")}</a>
          </Button>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <LangSwitcher />
          <button
            className="p-2 rounded-md text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border animate-fade-in">
          <div className="container py-6 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium py-2 text-foreground/90"
              >
                {l.label}
              </a>
            ))}
            <Button variant="gold" className="mt-2" asChild>
              <a href="#pricing" onClick={() => setOpen(false)}>{t("hero.cta.trial")}</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
