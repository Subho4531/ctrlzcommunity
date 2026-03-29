import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Globe, Smartphone, Cloud, Cpu, Link as LinkIcon, Palette } from "lucide-react";
import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";
import NeoButton from "@/components/ui/NeoButton";

const DomainsPage = () => {
  const domains = [
    {
      icon: Brain,
      name: "AI/ML",
      slug: "ai-ml",
      description: "Explore machine learning, neural networks, and artificial intelligence",
      details: "Dive into the world of artificial intelligence and machine learning. Learn about neural networks, deep learning, natural language processing, and computer vision.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop"
    },
    {
      icon: Globe,
      name: "Web Development",
      slug: "web",
      description: "Build modern web applications with cutting-edge frameworks",
      details: "Master modern web technologies including React, Vue, Node.js, and more. Create responsive, scalable web applications.",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2000&auto=format&fit=crop"
    },
    {
      icon: Smartphone,
      name: "App Development",
      slug: "app",
      description: "Create mobile applications for iOS and Android platforms",
      details: "Learn to build native and cross-platform mobile applications using React Native, Flutter, Swift, and Kotlin.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2000&auto=format&fit=crop"
    },
    {
      icon: Cloud,
      name: "Cloud Computing",
      slug: "cloud",
      description: "Master cloud services, DevOps, and scalable architectures",
      details: "Understand cloud platforms like AWS, Azure, and Google Cloud. Learn about containerization, orchestration, and CI/CD pipelines.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop"
    },
    {
      icon: Cpu,
      name: "IoT",
      slug: "iot",
      description: "Connect the physical and digital worlds with IoT solutions",
      details: "Work with sensors, microcontrollers, and embedded systems. Build smart devices and learn about IoT protocols.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop"
    },
    {
      icon: LinkIcon,
      name: "Blockchain",
      slug: "blockchain",
      description: "Dive into decentralized technologies and smart contracts",
      details: "Explore blockchain technology, cryptocurrency, smart contracts, and decentralized applications (dApps).",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f4e206b?q=80&w=2000&auto=format&fit=crop"
    },
    {
      icon: Palette,
      name: "UI/UX Design",
      slug: "ui-ux",
      description: "Design intuitive interfaces and create engaging user experiences",
      details: "Master the principles of user interface and user experience design. Learn wireframing, prototyping, user research, and tools like Figma.",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container">
          <div className="text-center space-y-6 mb-16 animate-fade-in relative z-10">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">
              OUR <span className="text-[#00FF41]">DOMAINS</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold tracking-widest uppercase text-muted-foreground max-w-3xl mx-auto">
              Explore diverse technology domains and find your passion
            </p>
          </div>

          <div className="mt-8 md:mt-16 w-full max-w-6xl mx-auto">
            <ScrollStack useWindowScroll={true} itemDistance={500} itemStackDistance={40} itemScale={0.03} baseScale={0.88} blurAmount={2} stackPosition="15%">
              {domains.map((domain, index) => (
                <ScrollStackItem key={domain.slug} itemClassName="bg-surface border-[3px] border-black shadow-[8px_8px_0_#00FF41] flex flex-col group !p-0 overflow-hidden min-h-[400px]">
                  
                  {/* Window Header */}
                  <div className="flex items-center px-4 h-10 bg-[#00FF41] border-b-[3px] border-black text-black font-black uppercase tracking-widest text-sm w-full">
                    <div className="flex space-x-2 mr-4">
                      <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                      <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                      <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                    </div>
                    SCANNING: {domain.slug.toUpperCase()}
                  </div>

                  {/* Window Content Layout */}
                  <div className="flex flex-col md:flex-row flex-1 w-full relative">
                    {/* Left content side */}
                    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 lg:p-10 relative z-10 w-full md:w-[60%] bg-surface/90 backdrop-blur-md border-r-0 md:border-r-[3px] border-black">
                    <div>
                      <domain.icon className="h-10 w-10 md:h-12 md:w-12 mb-4 md:mb-6 text-[#00FF41] group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(0,255,65,0.3)] rounded-2xl bg-[#00FF41]/10 p-2 md:p-3" />
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase mb-3 text-white tracking-tight leading-none">{domain.name}</h2>
                      <p className="text-[#00FF41] uppercase tracking-wider font-bold text-xs md:text-sm mb-4 bg-[#00FF41]/10 w-max px-3 py-1 rounded-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{domain.description}</p>
                      <p className="text-muted-foreground leading-relaxed text-sm lg:text-base font-medium">
                        {domain.details}
                      </p>
                    </div>
                    <div className="pt-6 w-full flex mt-auto">
                      <Link to="/join" className="w-full sm:w-auto">
                        <NeoButton text="Get Started" className="text-sm md:text-base w-full" />
                      </Link>
                    </div>
                  </div>

                  {/* Right image side */}
                  <div className="absolute inset-0 md:relative md:inset-auto w-full md:w-[40%] h-full z-0 bg-black">
                      <div className="absolute inset-0 bg-[#00FF41]/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none"></div>
                      <img 
                        src={domain.image} 
                        alt={domain.name} 
                        className="w-full h-full object-cover opacity-30 md:opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out grayscale group-hover:grayscale-0"
                      />
                    </div>
                  </div>

                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DomainsPage;
