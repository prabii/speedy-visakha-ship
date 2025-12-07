import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <Services />
      <Footer />
    </main>
  );
};

export default Home;