import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import BudgetForm from "@/components/BudgetForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <BudgetForm />
    </div>
  );
};

export default Index;
