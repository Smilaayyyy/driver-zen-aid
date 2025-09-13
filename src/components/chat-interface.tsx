import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Mic, 
  MicOff,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Shield,
  FileText,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: string;
  data?: any;
}

interface ChatInterfaceProps {
  mockData: any;
  isListening: boolean;
}

export function ChatInterface({ mockData, isListening }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI driver assistant. I can help you with earnings, loans, insurance, penalties, and documents. How can I assist you today?",
      timestamp: new Date(),
      intent: "greeting"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: "Today's Earnings", intent: "earnings", icon: TrendingUp },
    { label: "Penalties", intent: "penalties", icon: AlertTriangle },
    { label: "Loan Status", intent: "loan", icon: CreditCard },
    { label: "Insurance", intent: "insurance", icon: Shield },
    { label: "Documents", intent: "documents", icon: FileText },
    { label: "Help", intent: "help", icon: HelpCircle }
  ];

  // Intent detection and response generation
  const processQuery = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    // Earnings queries
    if (lowerQuery.includes("earning") || lowerQuery.includes("income") || lowerQuery.includes("money")) {
      if (lowerQuery.includes("today")) {
        return `Today's earnings: Gross ₹${mockData.earnings.today.gross}, Expenses ₹${mockData.earnings.today.expenses}, Penalties ₹${mockData.earnings.today.penalty}, Net ₹${mockData.earnings.today.net}. ${mockData.advice?.earnings || ""}`;
      } else if (lowerQuery.includes("week")) {
        return `This week's earnings: Gross ₹${mockData.earnings.this_week.gross}, Net ₹${mockData.earnings.this_week.net}. You're doing great!`;
      }
      return `Your recent earnings - Today: ₹${mockData.earnings.today.net} net, This week: ₹${mockData.earnings.this_week.net} net.`;
    }

    // Penalty queries
    if (lowerQuery.includes("penalty") || lowerQuery.includes("fine") || lowerQuery.includes("violation")) {
      return `Recent penalties: Late delivery ₹200, Traffic violation ₹500, Other ₹100. ${mockData.advice?.penalties || ""}`;
    }

    // Loan queries
    if (lowerQuery.includes("loan") || lowerQuery.includes("emi") || lowerQuery.includes("installment")) {
      return `Loan details: Balance ₹50,000, Next installment ₹5,000 due on ${mockData.loan.due_date}. ${mockData.advice?.loan || ""}`;
    }

    // Insurance queries
    if (lowerQuery.includes("insurance") || lowerQuery.includes("policy")) {
      return `Insurance Status: ${mockData.insurance.premium_status} - Policy ${mockData.insurance.policy_number}, Coverage: ${mockData.insurance.coverage}, Expires: ${mockData.insurance.expiry}`;
    }

    // Document queries
    if (lowerQuery.includes("document") || lowerQuery.includes("paper") || lowerQuery.includes("kyc")) {
      return "For document assistance, please switch to Form Mode. I can help you with Aadhar, PAN, Vehicle RC, and other document verification.";
    }

    // Default response
    return "I can help you with earnings, penalties, loans, insurance, and documents. Please ask me about any of these topics or use the quick action buttons below.";
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(async () => {
      const response = await processQuery(content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleQuickAction = (intent: string) => {
    let query = "";
    switch (intent) {
      case "earnings":
        query = "Show me today's earnings";
        break;
      case "penalties":
        query = "What are my recent penalties?";
        break;
      case "loan":
        query = "What's my loan status?";
        break;
      case "insurance":
        query = "Check my insurance status";
        break;
      case "documents":
        query = "Help me with documents";
        break;
      case "help":
        query = "What can you help me with?";
        break;
      default:
        query = "Help me";
    }
    handleSendMessage(query);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-driver-primary" />
          Chat Assistant
          {isListening && (
            <Badge variant="destructive" className="animate-pulse">
              Listening...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.intent}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.intent)}
                className="flex items-center gap-1 text-xs hover:bg-driver-primary/10"
              >
                <Icon className="h-3 w-3" />
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex gap-2 max-w-[80%]",
                    message.type === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      message.type === "user" 
                        ? "bg-driver-primary text-white" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      message.type === "user"
                        ? "bg-driver-primary text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about earnings, penalties, loans, insurance..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            disabled={isProcessing}
          />
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isProcessing || !inputValue.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}