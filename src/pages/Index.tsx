import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import HadithStrip from "@/components/site/HadithStrip";
import About from "@/components/site/About";
import Courses from "@/components/site/Courses";
import Pricing from "@/components/site/Pricing";
import Testimonials from "@/components/site/Testimonials";
import Blog from "@/components/site/Blog";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Almustafa Quran Academy — Learn Quran Online with Expert Teachers"
        description="Learn Quran online with certified teachers. 1-on-1 Tajweed, Hifz, Tafseer & Noorani Qaida classes for kids & adults. Start your free trial today."
        canonical={typeof window !== "undefined" ? window.location.origin + "/" : undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "Almustafa Quran Academy",
          description:
            "Online Quran academy offering 1-on-1 Tajweed, Hifz, Tafseer and Noorani Qaida classes worldwide.",
          url: typeof window !== "undefined" ? window.location.origin : undefined,
        }}
      />
      <Navbar />
      <Hero />
      <HadithStrip />
      <About />
      <Courses />
      <Pricing />
      <Testimonials />
      <Blog />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
