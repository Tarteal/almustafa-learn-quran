const Footer = () => {
  return (
    <footer className="relative bg-emerald-deep text-background pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-10" />
      <div className="container relative">
        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-background/10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 rounded-full bg-gold/15 border border-gold/30 grid place-items-center">
                <span className="font-arabic text-gold-light text-xl">ﷲ</span>
              </div>
              <div>
                <div className="font-display text-xl">Almustafa</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold-light">Quran Academy</div>
              </div>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-md mb-5">
              Bringing the Quran into homes worldwide — one ayah at a time. Authentic
              learning, certified scholars, modern convenience.
            </p>
            <p className="font-arabic text-2xl text-gold-light/80">
              وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
            </p>
          </div>

          <div>
            <h4 className="font-display text-base mb-4 text-gold-light">Programs</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              {["Noorani Qaida", "Quran Reading", "Tajweed", "Hifz Program", "Tafseer"].map((l) => (
                <li key={l}><a href="#courses" className="hover:text-gold-light transition-smooth">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4 text-gold-light">Academy</h4>
            <ul className="space-y-2.5 text-sm text-background/70">
              {[
                ["About Us", "#about"],
                ["Pricing", "#pricing"],
                ["Blog", "#blog"],
                ["Contact", "#contact"],
                ["Free Trial", "#pricing"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="hover:text-gold-light transition-smooth">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-background/50">
          <div>© {new Date().getFullYear()} Almustafa Quran Academy. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-light transition-smooth">Privacy</a>
            <a href="#" className="hover:text-gold-light transition-smooth">Terms</a>
            <a href="#" className="hover:text-gold-light transition-smooth">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
