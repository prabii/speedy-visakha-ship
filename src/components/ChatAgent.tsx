import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X, Bot, User, Package, Calculator, Phone, MapPin, Clock } from "lucide-react";

interface Message {
  id: string;
  type: 'bot' | 'user';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

export const ChatAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Hello! I\'m your AI shipping assistant. I can help you with rates, tracking, booking, and general shipping questions. How can I assist you today?',
      timestamp: new Date(),
      suggestions: ['Calculate Rates', 'Track Package', 'Book Shipment', 'Contact Info']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): { message: string; suggestions?: string[] } => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Enhanced AI responses with contextual understanding
    if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('rate')) {
      return {
        message: "I can help you calculate shipping rates! Our pricing depends on destination, weight, and service type. We offer:\n\n📦 Express Delivery: $25/kg (1-3 days)\n🚛 Standard Shipping: $15/kg (3-7 days)\n🚢 Economy Shipping: $8/kg (7-14 days)\n\nWould you like me to help you calculate an exact rate?",
        suggestions: ['Calculate Exact Rate', 'Service Comparison', 'Volume Discounts']
      };
    }
    
    if (lowercaseMessage.includes('track') || lowercaseMessage.includes('status') || lowercaseMessage.includes('where')) {
      return {
        message: "I can help you track your package! Please provide your tracking number (format: VIC########). If you don't have a tracking number, I can look it up using your booking reference or email address.",
        suggestions: ['Enter Tracking Number', 'Find by Email', 'Booking Reference']
      };
    }
    
    if (lowercaseMessage.includes('book') || lowercaseMessage.includes('ship') || lowercaseMessage.includes('send')) {
      return {
        message: "Great! I can guide you through booking a shipment. You'll need:\n\n✅ Sender & receiver details\n✅ Package information (weight, dimensions)\n✅ Service preference\n✅ Payment method\n\nWould you like to start the booking process?",
        suggestions: ['Start Booking', 'Upload Documents', 'Bulk Shipping']
      };
    }
    
    if (lowercaseMessage.includes('time') || lowercaseMessage.includes('delivery') || lowercaseMessage.includes('fast')) {
      return {
        message: "Our delivery times vary by service and destination:\n\n⚡ Express: 1-3 business days (worldwide)\n📦 Standard: 3-7 business days\n🌍 Economy: 7-14 business days\n\nFor urgent shipments, we also offer same-day pickup in major cities!",
        suggestions: ['Same-day Pickup', 'Express Zones', 'Holiday Schedule']
      };
    }
    
    if (lowercaseMessage.includes('contact') || lowercaseMessage.includes('phone') || lowercaseMessage.includes('office')) {
      return {
        message: "Here's how to reach us:\n\n📞 Phone: +91 832 853 8901\n📧 Email: info@visakhacouriers.com\n💬 WhatsApp: +91 832 853 8901\n🏢 Office: Visakhapatnam, India\n\nOur customer service is available 24/7 for urgent matters!",
        suggestions: ['Call Now', 'WhatsApp Chat', 'Office Hours']
      };
    }
    
    if (lowercaseMessage.includes('document') || lowercaseMessage.includes('customs') || lowercaseMessage.includes('requirement')) {
      return {
        message: "For international shipping, you'll need:\n\n📋 Commercial/Proforma Invoice\n📦 Packing List\n🆔 Valid ID (sender)\n📄 Customs Declaration\n\nI can help you prepare these documents or explain any specific country requirements.",
        suggestions: ['Document Templates', 'Country Requirements', 'Prohibited Items']
      };
    }
    
    if (lowercaseMessage.includes('insurance') || lowercaseMessage.includes('safe') || lowercaseMessage.includes('damage')) {
      return {
        message: "We offer comprehensive insurance coverage:\n\n🛡️ Standard: Up to $100 (free)\n💎 Enhanced: Up to $1000 (+$5)\n🏆 Premium: Up to $5000 (+$15)\n\nAll packages are handled with care and tracked throughout the journey.",
        suggestions: ['Add Insurance', 'Claim Process', 'Package Safety']
      };
    }
    
    if (lowercaseMessage.includes('thank') || lowercaseMessage.includes('bye') || lowercaseMessage.includes('goodbye')) {
      return {
        message: "You're welcome! Thank you for choosing Visakha International Couriers. If you need any assistance in the future, I'm here 24/7. Have a great day! 🚀",
        suggestions: ['Rate Us', 'Newsletter', 'Follow Updates']
      };
    }
    
    // Default response with helpful suggestions
    return {
      message: "I understand you're looking for shipping assistance. I can help you with:\n\n📊 Rate calculations\n📦 Booking shipments\n🔍 Package tracking\n📞 Contact information\n📋 Documentation help\n\nWhat would you like to know more about?",
      suggestions: ['Calculate Rates', 'Book Shipment', 'Track Package', 'Get Help']
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      message: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: aiResponse.message,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800); // Random delay between 1.2-2s for realism
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-36 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <MessageSquare size={24} className="text-white" />
        </Button>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-36 w-96 h-[600px] shadow-2xl z-50 border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Shipping Assistant</CardTitle>
              <p className="text-sm text-blue-100">Online • Ready to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all duration-200 hover:bg-red-500/20 hover:text-red-100"
            title="Close Chat"
          >
            <X size={18} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.type === 'bot'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      }`}
                  >
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {msg.message}
                    </div>
                    <div className={`text-xs mt-1 opacity-70 ${msg.type === 'bot' ? 'text-gray-500' : 'text-blue-100'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
                
                {msg.suggestions && msg.type === 'bot' && (
                  <div className="ml-11 flex flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your shipping question..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 rounded-xl border-gray-200 focus:border-blue-400"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSend} 
              size="sm" 
              disabled={!input.trim() || isTyping}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4"
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-500">Powered by AI • Available 24/7</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
              title="Close Chat"
            >
              <X size={12} />
              Close
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};