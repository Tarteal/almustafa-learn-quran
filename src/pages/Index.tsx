import { useEffect } from "react";
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

const Index = () => {
  useEffect(() => {
    document.title = "Almustafa Quran Academy — Learn Quran Online with Expert Teachers";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "Learn Quran online with certified teachers. 1-on-1 Tajweed, Hifz, Tafseer & Noorani Qaida classes for kids & adults. Start your free trial today."
    );
    const link =
      document.querySelector('link[rel="canonical"]') ||
      (() => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        document.head.appendChild(l);
        return l;
      })();
    link.setAttribute("href", window.location.origin + "/");
  }, []);

  return (
    <main className="min-h-screen bg-background">
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
