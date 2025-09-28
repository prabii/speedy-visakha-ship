import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const whatsappLink = "https://wa.me/p/27444320585212138/918328538901";
  
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-110 z-50"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={24} />
    </a>
  );
};