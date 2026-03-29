import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import NeoButton from "@/components/ui/NeoButton";
import { CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const JoinSection = () => {
  const benefits = [
    "Real-World Projects",
    "Open Source & Hackathons",
    "Multi-Domain Learning",
    "Peer Collaboration",
    "Skill Development",
    "Community-Driven Growth",
  ];

  return (
    <section className="py-32 bg-background perspective-container overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-[#00FF41]/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container relative z-10">
        <div className="transform-style-3d transition-transform duration-700 ease-out max-w-5xl mx-auto group">
          <div className="bg-surface border-[3px] border-black shadow-[8px_8px_0_#00FF41] overflow-hidden group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0_#00FF41] transition-all duration-300">
            {/* Window Header */}
            <div className="flex items-center px-4 md:px-6 h-12 bg-[#00FF41] border-b-[3px] border-black text-black font-black uppercase tracking-widest text-sm md:text-base">
              <div className="flex space-x-2 md:space-x-3 mr-4">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
              </div>
              C:\USERS\JOIN_REQUEST
            </div>

            <div className="p-10 md:p-16 lg:p-20 bg-surface">
              <div className="max-w-3xl mx-auto text-center space-y-12">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
                WHY JOIN <br className="md:hidden" /> <span className="text-[#00FF41]">CTRLZ?</span>
              </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {benefits.map((benefit, index) => (
                <ScrollReveal
                  key={benefit}
                  direction="up"
                  delay={index * 0.1}
                  className="flex items-start space-x-4 p-4 rounded-md bg-transparent border-2 border-black hover:border-[#00FF41] transition-colors"
                >
                  <CheckCircle className="h-6 w-6 text-[#00FF41] flex-shrink-0 mt-0.5" />
                  <span className="text-lg font-bold uppercase tracking-wider text-white/90">{benefit}</span>
                </ScrollReveal>
              ))}
            </div>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Join a community where learners become creators, where ideas transform into impact, 
              and where you can code beyond limits under the pulse of true innovation.
            </p>

            <Link to="/join" className="inline-block mt-8">
              <NeoButton text="Apply to CtrlZ" />
            </Link>
          </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
