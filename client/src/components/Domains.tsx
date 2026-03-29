import { Link } from "react-router-dom";
import NeoButton from "@/components/ui/NeoButton";
import { Brain, Globe, Smartphone, Cloud, Cpu, Link as LinkIcon, Palette } from "lucide-react";
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap";

const Domains = () => {
  const domains = [
    {
      icon: Brain,
      name: "AI/ML",
      slug: "ai-ml",
      description: "Explore machine learning, neural networks, and artificial intelligence",
    },
    {
      icon: Globe,
      name: "Web Development",
      slug: "web",
      description: "Build modern web applications with cutting-edge frameworks",
    },
    {
      icon: Smartphone,
      name: "App Development",
      slug: "app",
      description: "Create mobile applications for iOS and Android platforms",
    },
    {
      icon: Cloud,
      name: "Cloud Computing",
      slug: "cloud",
      description: "Master cloud services, DevOps, and scalable architectures",
    },
    {
      icon: Cpu,
      name: "IoT",
      slug: "iot",
      description: "Connect the physical and digital worlds with IoT solutions",
    },
    {
      icon: LinkIcon,
      name: "Blockchain",
      slug: "blockchain",
      description: "Dive into decentralized technologies and smart contracts",
    },
    {
      icon: Palette,
      name: "UI/UX Design",
      slug: "ui-ux",
      description: "Design intuitive interfaces and create engaging user experiences",
    },
  ];

  return (
    <section className="py-32 bg-background perspective-container overflow-hidden">
      <div className="container mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left Text content */}
          <div className="text-left space-y-6 animate-slide-up z-10 relative">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              EXPLORE <br/> <span className="text-[#00FF41]">DOMAINS</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg uppercase tracking-widest font-bold text-white/50">
              Choose your path and dive deep into cutting-edge technologies. Discover endless possibilities with our diverse learning tracks.
            </p>
            <Link to="/domains" className="inline-block mt-10">
              <NeoButton text="View All Domains" />
            </Link>
          </div>
          
          {/* Right CardSwap content */}
          <div className="relative h-[500px] md:h-[600px] w-full flex justify-end">
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={2000}
              pauseOnHover={true}
              width={350}
              height={450}
            >
              {domains.map((domain, index) => (
                <SwapCard key={domain.slug} customClass="bg-surface border border-border/20 shadow-2xl p-10 flex flex-col justify-between hover:border-[#00FF41]/40 transition-colors duration-300">
                  <div>
                    <domain.icon className="h-16 w-16 mb-8 text-[#00FF41] opacity-90 drop-shadow-[0_0_15px_rgba(0,255,65,0.4)]" />
                    <h3 className="text-3xl font-black uppercase mb-4 text-white">{domain.name}</h3>
                    <p className="text-muted-foreground mb-8 leading-relaxed text-lg font-medium">
                      {domain.description}
                    </p>
                  </div>
                  <Link to={`/domains/${domain.slug}`} className="w-full mt-4 flex justify-center">
                    <NeoButton text="Enter Domain" />
                  </Link>
                </SwapCard>
              ))}
            </CardSwap>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Domains;
