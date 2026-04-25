import { ReactNode } from "react";

const SectionHeading = ({
  eyebrow,
  title,
  description,
  light,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  light?: boolean;
}) => (
  <div className="text-center max-w-3xl mx-auto mb-16">
    <div className="divider-ornament mb-5">
      <span
        className={`text-xs font-medium tracking-[0.3em] uppercase ${
          light ? "text-gold-light" : "text-gold-deep"
        }`}
      >
        {eyebrow}
      </span>
    </div>
    <h2
      className={`font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight ${
        light ? "text-background" : "text-foreground"
      }`}
    >
      {title}
    </h2>
    {description && (
      <p
        className={`mt-5 text-lg leading-relaxed ${
          light ? "text-background/70" : "text-muted-foreground"
        }`}
      >
        {description}
      </p>
    )}
  </div>
);

export default SectionHeading;
