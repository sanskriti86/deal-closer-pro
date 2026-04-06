import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProcessSection from "@/components/ProcessSection";
import TrustSection from "@/components/TrustSection";
import AboutSection from "@/components/AboutSection";
import PricingSection from "@/components/PricingSection";
import PolicyHighlights from "@/components/PolicyHighlights";
import ContactForm from "@/components/ContactForm";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleBuy = (plan: string) => {
    setSelectedPlan(plan);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProcessSection />
      <AboutSection />
      <PricingSection onBuy={handleBuy} />
      <PolicyHighlights />
      <ContactForm open={formOpen} onClose={() => setFormOpen(false)} selectedPlan={selectedPlan} />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
