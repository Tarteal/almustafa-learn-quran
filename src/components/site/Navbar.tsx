import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";
import LangSwitcher from "./LangSwitcher";

const Navbar = () => {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // On non-home pages, the page background is light, so white text is unreadable.
  // Use foreground color for inner pages, and white for the home hero overlay.
  const brandText = isHome ? "text-white" : "text-foreground";
  const linkText = isHome ? "text-white/80" : "text-foreground/80";
  const mobileLinkText = isHome ? "text-white/90" : "text-foreground/90";
  const iconText = isHome ? "text-white" : "text-foreground";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    setOpen(false);
    navigate("/");
  };

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
            <div className={`font-display text-lg font-semibold ${brandText}`}>Almustafa</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-gold-deep font-medium">Quran Academy</div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium ${linkText} hover:text-gold transition-smooth relative group`}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-smooth origin-left" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LangSwitcher onLight={!isHome} />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/enroll">Enroll</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth?mode=signin">{t("nav.signin")}</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/enroll">Enroll</Link>
              </Button>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <LangSwitcher onLight={!isHome} />
          <button
            className={`p-2 rounded-md ${iconText}`}
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
                className={`text-base font-medium py-2 ${mobileLinkText}`}
              >
                {l.label}
              </a>
            ))}
            <Button variant="gold" className="mt-2" asChild>
              <Link to="/enroll" onClick={() => setOpen(false)}>Enroll Now</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link to="/auth?mode=signin" onClick={() => setOpen(false)}>{t("nav.signin")}</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
