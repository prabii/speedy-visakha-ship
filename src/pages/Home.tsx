import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";
import HomePricingSection from "@/components/HomePricingSection";

const Home = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <Services />
      <HomePricingSection />
      <Footer />
    </main>
  );
};

export default Home;