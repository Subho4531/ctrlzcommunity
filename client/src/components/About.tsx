import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import NeoButton from "@/components/ui/NeoButton";
import ScrollReveal from "@/components/ui/ScrollReveal";

const About = () => {
  return (
    <section id="about" className="py-32 bg-background perspective-container">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="right" delay={0.2} className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              ABOUT <br /> <span className="text-[#00FF41]">CTRLZ</span>
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                CtrlZ is a student-driven tech community that bridges the gap between learning and real-world application. 
                Through workshops, open-source projects, and hackathons, members gain hands-on experience across AI/ML, 
                Web, App, Cloud, IoT and more.
              </p>
              <p>
                We focus on teamwork, practical skills, and building impact — where learners become creators.
              </p>
            </div>
            <Link to="/about" className="inline-block mt-8">
              <NeoButton text="Read More" />
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.4} className="transform-style-3d transition-transform duration-700 ease-out group">
            <div className="bg-surface border-[3px] border-black shadow-[8px_8px_0_#00FF41] overflow-hidden group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0_#00FF41] transition-all duration-300">
              {/* Window Header */}
              <div className="flex items-center px-4 h-10 bg-[#00FF41] border-b-[3px] border-black text-black font-black uppercase tracking-widest text-sm">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                  <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                  <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden"></div>
                </div>
                C:\SYSTEM\ABOUT
              </div>

              <div className="p-8 lg:p-12 space-y-8 bg-surface">
                <div className="flex items-center space-x-6">
                  <div className="w-20 rounded-xl overflow-hidden border border-[#00FF41]/30 p-2 bg-background">
                    <img src="ctrlz_icon_round.png" alt="CtrlZ" className="w-full h-full object-cover grayscale opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase text-white mb-2">Community First</h3>
                    <span className="text-[#00FF41] text-xs font-bold tracking-widest uppercase block">Building together</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Join a vibrant community of student developers, designers, and innovators 
                  who are passionate about technology and making a difference.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default About;
