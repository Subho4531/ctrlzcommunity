import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeoButton from "@/components/ui/NeoButton";
import GooeyNav from "@/components/ui/GooeyNav";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Domains", href: "/domains" },
    { label: "Our Community", href: "/community" },
    { label: "Projects", href: "/projects" },
    { label: "Events", href: "/events" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl rounded-full border-2 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 animate-border-neon transition-all duration-300">
      <div className="relative px-6 md:px-8 w-full flex h-16 items-center justify-between z-10">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-background">
            <img
              src="/ctrlz_icon_round.png"
              alt="CtrlZ Logo"
              className=""
            />
          </div>

          {/* <span className="text-2xl font-bold">CtrlZ</span> */}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <GooeyNav 
            items={navLinks}
            particleCount={30}
            particleDistances={[120, 10]}
            particleR={120}
            animationTime={500}
            timeVariance={200}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-2"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Link to="/join" className="ml-4">
            <NeoButton text="Get Started" className="text-sm" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden absolute left-0 right-0 top-20 rounded-3xl border border-border/40 bg-background/95 backdrop-blur-xl transition-all duration-300 shadow-2xl",
          isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4 pointer-events-none"
        )}
      >
        <div className="container py-8 flex flex-col space-y-4 ">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-full justify-start rounded-sm px-2"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <>
                  <Sun className="h-5 w-5 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-2" />
                  Dark Mode
                </>
              )
            ) : (
              <>
                <Sun className="h-5 w-5 mr-2" />
                Theme
              </>
            )}
          </Button>
          <Link to="/join" onClick={() => setIsOpen(false)} className="w-full flex justify-center mt-6">
            <NeoButton text="Get Started" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
