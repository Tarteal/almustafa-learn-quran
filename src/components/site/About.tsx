import SectionHeading from "./SectionHeading";
import quranImg from "@/assets/quran-about.jpg";
import { Award, Clock, Globe2, Heart } from "lucide-react";

const features = [
  { icon: Award, title: "Certified Scholars", text: "Egyptian & Pakistani Ijazah-holding teachers." },
  { icon: Clock, title: "Flexible Timings", text: "Schedule classes around your timezone, 24/7." },
  { icon: Globe2, title: "Global Community", text: "Students from 45+ countries learning together." },
  { icon: Heart, title: "Personalized Path", text: "Tailored 1-on-1 lessons for every level." },
];

const About = () => {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="absolute inset-0 pattern-overlay" />
      <div className="container relative">
        <SectionHeading
          eyebrow="About the Academy"
          title={<>Where the <em className="text-gradient-gold not-italic font-display">Quran</em> meets the modern learner</>}
          description="Almustafa Quran Academy is dedicated to making authentic Quranic education accessible to every Muslim, anywhere in the world — with warmth, discipline, and excellence."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with arch frame */}
          <div className="relative">
            <div className="relative arch-top overflow-hidden shadow-deep border-4 border-gold/30">
              <img
                src={quranImg}
                alt="Open Quran on a wooden rehal"
                className="w-full aspect-[4/5] object-cover"
                loading="lazy"
                width={1280}
                height={1280}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/40 via-transparent to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 md:-right-10 bg-card border border-gold/30 rounded-2xl px-6 py-5 shadow-elegant max-w-[220px]">
              <div className="font-arabic text-2xl text-primary mb-1">إقرأ</div>
              <div className="text-xs text-muted-foreground">
                "Read in the name of your Lord who created."
              </div>
            </div>
            {/* Decorative corner */}
            <div className="absolute -top-6 -left-6 w-24 h-24 border-l-2 border-t-2 border-gold/60 rounded-tl-2xl" />
          </div>

          {/* Content */}
          <div>
            <h3 className="font-display text-2xl md:text-3xl mb-4 text-foreground">Our Mission & Vision</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe every Muslim deserves a personal, patient teacher to guide
              them through the words of Allah ﷻ. From the first letter of Noorani
              Qaida to memorizing the entire Quran, our scholars walk beside you
              every step of the way.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our vision is a generation of confident reciters who understand
              what they read — connecting hearts to the Book through proper
              Tajweed and meaningful Tafseer.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group p-5 rounded-xl bg-card border border-border hover:border-gold/50 hover:shadow-card transition-smooth"
                >
                  <div className="h-11 w-11 rounded-lg gradient-emerald grid place-items-center mb-3 group-hover:scale-110 transition-bounce">
                    <f.icon className="h-5 w-5 text-gold-light" />
                  </div>
                  <h4 className="font-display text-lg text-foreground mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
