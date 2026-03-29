import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Domains from "@/components/Domains";
import JoinSection from "@/components/JoinSection";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ui/ScrollReveal";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center bg-background">
      <Navbar />
      <main>
        <Hero />
        <ScrollReveal>
          <Features />
        </ScrollReveal>
        <ScrollReveal>
          <About />
        </ScrollReveal>
        <ScrollReveal>
          <Domains />
        </ScrollReveal>
        <ScrollReveal>
          <JoinSection />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
