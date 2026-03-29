import React from 'react';
import { cn } from "@/lib/utils";
import NeoButton from "./NeoButton";

interface FeatureCardProps {
  title: string;
  category: string;
  description: string;
  image?: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, category, description, image, className }) => {
  return (
    <div className={cn(
      "relative font-sans bg-surface border-[3px] border-black transition-all duration-300 flex flex-col group",
      "hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0_#00FF41]",
      "shadow-[8px_8px_0_#00FF41]",
      className
    )}>
      {/* Window Header */}
      <div className="flex items-center px-4 h-10 bg-[#00FF41] border-b-[3px] border-black text-black font-black uppercase tracking-widest text-sm">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden">
             {/* Mimicking macOS window buttons in a brutalist context */}
          </div>
          <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden">
          </div>
          <div className="w-3 h-3 rounded-full bg-black/90 flex items-center justify-center overflow-hidden">
             
          </div>
        </div>
        {category}
      </div>

      {/* Window Content */}
      <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10 bg-surface">
        {image && (
          <div className="w-full h-48 mb-6 border-[3px] border-black relative group-hover:shadow-[6px_6px_0_#00FF41] transition-all duration-300">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 grayscale group-hover:grayscale-0" />
            <div className="absolute inset-0 bg-[#00FF41]/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-300"></div>
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-4 leading-tight">{title}</h3>
        <p className="text-muted-foreground font-medium text-base mb-8 flex-1">
          {description}
        </p>
        <div className="mt-auto relative z-20">
          <NeoButton text="Learn More" className="text-sm md:text-base w-full flex justify-center" />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
