import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll be in touch soon, in shaa Allah.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-secondary/40">
      <div className="container relative">
        <SectionHeading
          eyebrow="Get in Touch"
          title={<>Have a question? <em className="text-gradient-gold not-italic font-display">Let's talk.</em></>}
          description="Our admissions team usually replies within a few hours. We're here to help."
        />

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Contact info */}
          <div className="lg:col-span-2 gradient-emerald text-background rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 pattern-overlay opacity-20" />
            <div className="relative">
              <h3 className="font-display text-2xl mb-2">Reach Almustafa</h3>
              <p className="text-background/70 text-sm mb-8">
                Whether you're starting your journey or just curious — reach out.
              </p>

              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email", value: "hello@almustafaquran.com" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Office", value: "Online · Worldwide" },
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
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-3 bg-card rounded-2xl p-8 border border-border shadow-card space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                <Input required maxLength={100} placeholder="Abdullah Ahmed" className="h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input required type="email" maxLength={255} placeholder="you@example.com" className="h-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Course of Interest</label>
              <Input maxLength={100} placeholder="e.g. Tajweed, Hifz, Noorani Qaida" className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
              <Textarea required maxLength={1000} rows={5} placeholder="Tell us about your goals and current level..." />
            </div>
            <Button type="submit" variant="emerald" size="lg" className="w-full sm:w-auto">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
