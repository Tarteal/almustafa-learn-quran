import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: 45,
    desc: "Perfect for beginners getting started",
    features: ["2 classes per week", "30 minutes per class", "1-on-1 with teacher", "Progress reports", "Email support"],
    popular: false,
  },
  {
    name: "Standard",
    price: 75,
    desc: "Most popular — balanced & effective",
    features: ["3 classes per week", "45 minutes per class", "1-on-1 with teacher", "Weekly assessments", "Free study materials", "Priority support"],
    popular: true,
  },
  {
    name: "Premium",
    price: 120,
    desc: "Intensive learning for fast results",
    features: ["5 classes per week", "60 minutes per class", "Choose your teacher", "Monthly Ijazah review", "Tafseer included", "Hifz tracking", "24/7 priority support"],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="container relative">
        <SectionHeading
          eyebrow="Pricing & Packages"
          title={<>Simple, transparent <em className="text-gradient-gold not-italic font-display">pricing</em></>}
          description="Start with a free 3-day trial — no card required. Cancel anytime, no hidden fees."
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 gradient-gold text-emerald-deep text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-gold">
                  <Star className="h-3 w-3 fill-current" /> Most Popular
                </div>
              )}

              <h3 className="font-display text-2xl mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                {plan.desc}
              </p>

              <div className="mb-8">
                <span className="font-display text-5xl font-semibold">${plan.price}</span>
                <span className={`text-sm ml-1 ${plan.popular ? "text-background/60" : "text-muted-foreground"}`}>/month</span>
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
              >
                Subscribe Now
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          🔒 Secure payments · 💯 30-day money-back guarantee · 🎁 First 3 days free
        </p>
      </div>
    </section>
  );
};

export default Pricing;
