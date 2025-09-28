import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X } from "lucide-react";

export const ChatAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      message: 'Hello! I\'m here to help with your shipping queries. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', message: input }]);
    
    // Simple bot responses
    setTimeout(() => {
      let botResponse = "Thank you for your message. For detailed assistance, please contact us at +91 832 853 8901 or use our WhatsApp service.";
      
      if (input.toLowerCase().includes('price') || input.toLowerCase().includes('cost')) {
        botResponse = "Our pricing varies by destination and weight. Please check our pricing page or contact us for a custom quote.";
      } else if (input.toLowerCase().includes('track')) {
        botResponse = "To track your package, please provide your tracking number or contact us with your booking details.";
      } else if (input.toLowerCase().includes('time') || input.toLowerCase().includes('delivery')) {
        botResponse = "Delivery times vary by destination. International shipments typically take 3-7 business days.";
      }
      
      setMessages(prev => [...prev, { type: 'bot', message: botResponse }]);
    }, 1000);
    
    setInput('');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-elegant hover:shadow-glow z-50"
        variant="secondary"
      >
        <MessageSquare size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 left-6 w-80 h-96 shadow-elegant z-50">
      <CardHeader className="bg-gradient-primary text-white p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat Support</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg text-sm ${
                msg.type === 'bot'
                  ? 'bg-muted text-foreground'
                  : 'bg-gradient-primary text-white ml-auto max-w-[80%]'
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} size="sm">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};