import FeatureCard from "@/components/ui/FeatureCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

const Features = () => {
  return (
    <section className="py-32 bg-background relative" id="showcase">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#00FF41_1px,transparent_1px),linear-gradient(to_bottom,#00FF41_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 animate-slide-up">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase max-w-xl leading-none">
            LATEST <br/> <span className="text-[#00FF41]">EVENTS & PROJECTS</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md pb-4">
            Discover our flagship events, hacks, and global industry partnerships building the future.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-16 px-2 md:px-4">
          <ScrollReveal direction="up" delay={0.2}>
            <FeatureCard 
              category="C:\> FLAGSHIP_EVENT" 
              title="Global Hackathon 2026" 
              description="Join thousands of developers in our annual multi-domain hackathon. Build solutions that reverse limits and create limitless possibilities."
              image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070"
            />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <FeatureCard 
              category="C:\> PARTNERSHIP" 
              title="Google For Developers" 
              description="Collaborating with industry leaders to bring you exclusive resources, mentorship, and beta access to tomorrow's technology."
              image="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070"
            />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.6}>
            <FeatureCard 
              category="C:\> WORKSHOP" 
              title="Advanced AI Models" 
              description="Hands-on sessions breaking down the architecture of modern LLMs, Transformers, and scalable inference environments."
              image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Features;
