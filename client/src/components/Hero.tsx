import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThreeBackground } from "./ui/three-background";
import ScrollReveal from "./ui/ScrollReveal";

const Hero = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    aboutSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 lg:pt-56 lg:pb-24 min-h-screen overflow-hidden flex flex-col items-center justify-center perspective-container">
      <div className="absolute inset-0 z-0 bg-background">
        <ThreeBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background z-10"></div>
      </div>
      <div className="container relative z-20 pointer-events-auto mt-16 flex flex-col items-center text-center">
        <ScrollReveal direction="up" delay={0.2}>
          <h1 className="text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl uppercase flex flex-col items-center text-center leading-none">
            <span>REVERSING LIMITS</span>
            <span className="text-[#00FF41] whitespace-nowrap">CREATING POSSIBILITIES</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.4}>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed mt-8">
            Unite under the violet pulse of innovation — where visionaries code beyond limits,
            shaping a universe of intelligence and imagination.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Button asChild size="lg" className="rounded-full text-base px-8 h-12">
              <Link to="/join">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full text-base px-8 h-12 text-[#00FF41] border-[#00FF41] hover:bg-[#00FF41]/10 transition-colors"
              onClick={scrollToAbout}
            >
              Learn More
            </Button>
          </div>
        </ScrollReveal>
      </div>

    </section>
  );
};

export default Hero;
