import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

const Contact = () => {
  const { t } = useI18n();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("contact.form.success"));
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-secondary/40">
      <div className="container relative">
        <SectionHeading
          eyebrow={t("contact.eyebrow")}
          title={
            <>
              {t("contact.title.a")}{" "}
              <em className="text-gradient-gold not-italic font-display">{t("contact.title.b")}</em>
            </>
          }
          description={t("contact.desc")}
        />

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 gradient-emerald text-background rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 pattern-overlay opacity-20" />
            <div className="relative">
              <h3 className="font-display text-2xl mb-2">{t("contact.info.title")}</h3>
              <p className="text-background/70 text-sm mb-8">{t("contact.info.desc")}</p>

              <div className="space-y-5">
                {[
                  { icon: Mail, label: t("contact.email"), value: "hello@almustafaquran.com" },
                  { icon: Phone, label: t("contact.phone"), value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: t("contact.office"), value: t("contact.office.value") },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gold/15 border border-gold/30 grid place-items-center shrink-0">
                      <c.icon className="h-4 w-4 text-gold-light" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-background/60 mb-0.5">{c.label}</div>
                      <div className="text-background font-medium">{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/15551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-background/10 hover:bg-background/15 border border-background/20 transition-smooth text-background"
              >
                <MessageCircle className="h-4 w-4" /> {t("contact.whatsapp")}
              </a>
            </div>
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-3 bg-card rounded-2xl p-8 border border-border shadow-card space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t("contact.form.name")}</label>
                <Input required maxLength={100} placeholder={t("contact.form.name.ph")} className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t("contact.form.email")}</label>
                <Input required type="email" maxLength={255} placeholder={t("contact.form.email.ph")} className="h-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{t("contact.form.course")}</label>
              <Input maxLength={100} placeholder={t("contact.form.course.ph")} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{t("contact.form.message")}</label>
              <Textarea required maxLength={1000} rows={5} placeholder={t("contact.form.message.ph")} />
            </div>
            <Button type="submit" variant="emerald" size="lg" className="w-full sm:w-auto">
              <Send className="h-4 w-4 rtl-flip" /> {t("contact.form.send")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
