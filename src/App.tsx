import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import RateCalculator from "./pages/RateCalculator";
import BookShipment from "./pages/BookShipment";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/" element={
              <>
                <Header />
                <Home />
                <WhatsAppButton />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <About />
                <WhatsAppButton />
              </>
            } />
            <Route path="/services" element={
              <>
                <Header />
                <Services />
                <WhatsAppButton />
              </>
            } />
            <Route path="/pricing" element={
              <>
                <Header />
                <Pricing />
                <WhatsAppButton />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Header />
                <Contact />
                <WhatsAppButton />
              </>
            } />
            <Route path="/rate-calculator" element={
              <>
                <Header />
                <RateCalculator />
                <WhatsAppButton />
              </>
            } />
            <Route path="/book-shipment" element={
              <>
                <Header />
                <BookShipment />
                <WhatsAppButton />
              </>
            } />
            <Route path="*" element={
              <>
                <Header />
                <NotFound />
                <WhatsAppButton />
              </>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
