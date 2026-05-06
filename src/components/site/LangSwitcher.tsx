import { Languages, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGS, useI18n } from "@/i18n/I18nContext";

const LangSwitcher = ({ light = false, onLight = true }: { light?: boolean; onLight?: boolean }) => {
  const { lang, setLang } = useI18n();
  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-2 rounded-md px-3 h-9 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          light
            ? "text-background/90 hover:bg-white/10 border border-white/20"
            : onLight
              ? "text-foreground/80 hover:bg-foreground/5 border border-border"
              : "text-white/80 hover:bg-white/10 border border-white/20"
        }`}
        aria-label="Change language"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{current.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span className="flex flex-col">
              <span className={l.dir === "rtl" ? "font-arabic text-base" : ""}>{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </span>
            {l.code === lang && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LangSwitcher;
