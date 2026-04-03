import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Domains from "./pages/Domains";
import Community from "./pages/Community";
import Projects from "./pages/Projects";
import Events from "./pages/Events";
import Join from "./pages/Join";
import Contact from "./pages/Contact";
import MembersGrid from "./pages/MembersGrid";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";
import { BackgroundRippleEffect } from "./components/ui/background-ripple-effect";
import { SmoothCursor } from "./components/ui/smooth-cursor";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="hidden lg:block" >
          <SmoothCursor />
        </div>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>

              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/community" element={<Community />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/events" element={<Events />} />
              <Route path="/join" element={<Join />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/members-grid" element={<MembersGrid />} />
              <Route path="/admin-portal" element={<AdminPortal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
