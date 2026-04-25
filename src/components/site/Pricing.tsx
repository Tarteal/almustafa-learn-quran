import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

const Pricing = () => {
  const { t } = useI18n();
  const plans = [
    {
      planId: "basic",
      name: t("pricing.basic.name"),
      price: 45,
      desc: t("pricing.basic.desc"),
      features: ["2 classes/week", "30 min/class", "1-on-1 teacher", "Progress reports", "Email support"],
      popular: false,
    },
    {
      planId: "standard",
      name: t("pricing.standard.name"),
      price: 75,
      desc: t("pricing.standard.desc"),
      features: ["3 classes/week", "45 min/class", "1-on-1 teacher", "Weekly assessments", "Free study materials", "Priority support"],
      popular: true,
    },
    {
      planId: "premium",
      name: t("pricing.premium.name"),
      price: 120,
      desc: t("pricing.premium.desc"),
      features: ["5 classes/week", "60 min/class", "Choose your teacher", "Monthly Ijazah review", "Tafseer included", "Hifz tracking", "24/7 priority support"],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="container relative">
        <SectionHeading
          eyebrow={t("pricing.eyebrow")}
          title={
            <>
              {t("pricing.title.a")}{" "}
              <em className="text-gradient-gold not-italic font-display">{t("pricing.title.b")}</em>
            </>
          }
          description={t("pricing.desc")}
        />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-smooth hover:-translate-y-2 ${
                plan.popular
                  ? "gradient-emerald text-background shadow-deep border-2 border-gold/40 md:scale-105"
                  : "bg-card text-foreground border border-border hover:border-gold/40 hover:shadow-elegant"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 gradient-gold text-emerald-deep text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-gold whitespace-nowrap">
                  <Star className="h-3 w-3 fill-current" /> {t("pricing.popular")}
                </div>
              )}

              <h3 className="font-display text-2xl mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                {plan.desc}
              </p>

              <div className="mb-8">
                <span className="font-display text-5xl font-semibold">${plan.price}</span>
                <span className={`text-sm ml-1 ${plan.popular ? "text-background/60" : "text-muted-foreground"}`}>{t("pricing.month")}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 h-5 w-5 rounded-full grid place-items-center shrink-0 ${
                      plan.popular ? "bg-gold/20" : "bg-emerald/10"
                    }`}>
                      <Check className={`h-3 w-3 ${plan.popular ? "text-gold-light" : "text-emerald"}`} />
                    </div>
                    <span className={plan.popular ? "text-background/90" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "gold" : "emerald"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link to={`/enroll?plan=${plan.planId}`}>{t("pricing.subscribe")}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          {t("pricing.guarantees")}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
