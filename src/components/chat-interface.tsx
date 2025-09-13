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
  HelpCircle,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  mockData: any;
  isListening: boolean;
  language: string;
  assistanceMode: 'voice' | 'chat';
}

export function ChatInterface({ mockData, isListening, language, assistanceMode }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI driver assistant. I can help you with earnings, loans, insurance, penalties, and documents. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRecorder = useAudioRecorder();

  const quickActions = [
    { label: "Today's Earnings", intent: "earnings", icon: TrendingUp },
    { label: "Penalties", intent: "penalties", icon: AlertTriangle },
    { label: "Loan Status", intent: "loan", icon: CreditCard },
    { label: "Insurance", intent: "insurance", icon: Shield },
    { label: "Documents", intent: "documents", icon: FileText },
    { label: "Help", intent: "help", icon: HelpCircle }
  ];

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

    setTimeout(() => {
      // Mock assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `You said: "${content}"`,
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

  // Voice input: start/stop recording
  const handleVoiceInput = async () => {
    if (audioRecorder.isRecording) {
      audioRecorder.stopRecording();
    } else {
      audioRecorder.startRecording();
    }
  };

  // When recording stops, send a mock transcription
  useEffect(() => {
    if (audioRecorder.audioBlob && !audioRecorder.isRecording) {
      const processAudio = async () => {
        try {
          setIsProcessing(true);
          // Replace this with actual browser STT if available
          const simulatedTranscription = "User's spoken input";
          await handleSendMessage(simulatedTranscription);
        } catch (error) {
          console.error("Voice processing failed:", error);
        } finally {
          setIsProcessing(false);
          audioRecorder.clearRecording();
        }
      };
      processAudio();
    }
  }, [audioRecorder.audioBlob, audioRecorder.isRecording]);

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
            <Badge variant="destructive" className="animate-pulse">Listening...</Badge>
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
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.type === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("flex gap-2 max-w-[80%]", msg.type === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                    msg.type === "user" ? "bg-driver-primary text-white" : "bg-muted text-muted-foreground")}>
                    {msg.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn("rounded-lg px-3 py-2 text-sm",
                    msg.type === "user" ? "bg-driver-primary text-white" : "bg-muted text-foreground")}>
                    {msg.content}
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
            disabled={isProcessing || audioRecorder.isRecording}
          />

          {assistanceMode === 'voice' && (
            <Button
              onClick={handleVoiceInput}
              disabled={isProcessing}
              size="icon"
              variant={audioRecorder.isRecording ? "destructive" : "outline"}
              className={cn(audioRecorder.isRecording && "animate-pulse")}
            >
              {audioRecorder.isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}

          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isProcessing || !inputValue.trim() || audioRecorder.isRecording}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Recording indicator */}
        {audioRecorder.isRecording && (
          <div className="text-center">
            <Badge variant="destructive" className="animate-pulse">
              Recording... {Math.round(audioRecorder.duration / 1000)}s
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
