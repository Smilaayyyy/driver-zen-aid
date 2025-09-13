import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Mic, MicOff, Bot, User, TrendingUp, AlertTriangle, 
  CreditCard, Shield, FileText, HelpCircle, Volume2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { apiService } from "@/services/api";

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
  language: string;
  assistanceMode: 'voice' | 'chat';
}

export function ChatInterface({ mockData, isListening, language, assistanceMode }: ChatInterfaceProps) {
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRecorder = useAudioRecorder();

  const quickActions = [
    { label: "Today's Earnings", intent: "earnings", icon: TrendingUp },
    { label: "Penalties", intent: "penalties", icon: AlertTriangle },
    { label: "Loan Status", intent: "loan", icon: CreditCard },
    { label: "Insurance", intent: "insurance", icon: Shield },
    { label: "Documents", intent: "documents", icon: FileText },
    { label: "Help", intent: "help", icon: HelpCircle }
  ];

  // Play TTS audio
  const playTTS = async (text: string) => {
    if (assistanceMode !== 'voice') return;
    try {
      setIsPlayingAudio(true);
      const audioBlob = await apiService.textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => {
          audioRef.current!.onended = () => setIsPlayingAudio(false);
        }).catch(err => {
          console.error("Audio play blocked:", err);
          setIsPlayingAudio(false);
        });
      }
    } catch (error) {
      console.error('TTS failed:', error);
      setIsPlayingAudio(false);
    }
  };

  // Voice input handling
  const handleVoiceInput = async () => {
    if (audioRecorder.isRecording) {
      audioRecorder.stopRecording();
    } else {
      audioRecorder.startRecording();
    }
  };

  // Process audio after recording stops
  useEffect(() => {
    if (audioRecorder.audioBlob && !audioRecorder.isRecording) {
      const processAudio = async () => {
        const audioFile = audioRecorder.getAudioFile();
        if (!audioFile) return;

        setIsProcessing(true);
        try {
          const sttResult = await apiService.speechToText(audioFile);
          if (sttResult?.transcribed_text) {
            await handleSendMessage(sttResult.transcribed_text);
          }
        } catch (err) {
          console.error("STT failed:", err);
        } finally {
          setIsProcessing(false);
          audioRecorder.clearRecording();
        }
      };
      processAudio();
    }
  }, [audioRecorder.audioBlob, audioRecorder.isRecording]);

  // Process user query
  const processQuery = async (query: string): Promise<string> => {
    try {
      const intentResult = await apiService.processIntent(query, 'chat');
      if (intentResult.tts_ready) {
        playTTS(intentResult.tts_ready);
      }
      return intentResult.answer;
    } catch (error) {
      // fallback to mockData
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes("earning")) {
        if (lowerQuery.includes("today")) return `Today's earnings: Gross ₹${mockData.earnings.today.gross}, Net ₹${mockData.earnings.today.net}`;
        if (lowerQuery.includes("week")) return `This week's earnings: Gross ₹${mockData.earnings.this_week.gross}, Net ₹${mockData.earnings.this_week.net}`;
      }
      if (lowerQuery.includes("penalty")) return `Recent penalties: Late delivery ₹200, Traffic violation ₹500, Other ₹100`;
      if (lowerQuery.includes("loan")) return `Loan details: Balance ₹50,000, Next installment ₹5,000 due on ${mockData.loan.due_date}`;
      if (lowerQuery.includes("insurance")) return `Insurance Status: ${mockData.insurance.premium_status} - Policy ${mockData.insurance.policy_number}`;
      if (lowerQuery.includes("document")) return "For document assistance, please switch to Form Mode";
      return "I can help you with earnings, penalties, loans, insurance, and documents. Please ask me about any of these topics";
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), type: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    const response = await processQuery(content);
    const assistantMessage: ChatMessage = { id: (Date.now()+1).toString(), type: "assistant", content: response, timestamp: new Date() };
    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  };

  const handleQuickAction = (intent: string) => {
    const queries: Record<string,string> = {
      earnings: "Show me today's earnings",
      penalties: "What are my recent penalties?",
      loan: "What's my loan status?",
      insurance: "Check my insurance status",
      documents: "Help me with documents",
      help: "What can you help me with?"
    };
    handleSendMessage(queries[intent] || "Help me");
  };

  useEffect(() => {
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [messages]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-driver-primary" />
          Chat Assistant
          {isListening && <Badge variant="destructive" className="animate-pulse">Listening...</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions.map(a => {
            const Icon = a.icon;
            return (
              <Button key={a.intent} variant="outline" size="sm" onClick={() => handleQuickAction(a.intent)} className="flex items-center gap-1 text-xs hover:bg-driver-primary/10">
                <Icon className="h-3 w-3" /> {a.label}
              </Button>
            );
          })}
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-3", msg.type === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("flex gap-2 max-w-[80%]", msg.type === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", msg.type==="user"?"bg-driver-primary text-white":"bg-muted text-muted-foreground")}>
                    {msg.type==="user"?<User className="h-4 w-4"/>:<Bot className="h-4 w-4"/>}
                  </div>
                  <div className={cn("rounded-lg px-3 py-2 text-sm", msg.type==="user"?"bg-driver-primary text-white":"bg-muted text-foreground")}>{msg.content}</div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4 text-muted-foreground"/>
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"/>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"0.1s"}}/>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay:"0.2s"}}/>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input value={inputValue} onChange={e=>setInputValue(e.target.value)} placeholder="Ask about earnings, penalties, loans, insurance..." onKeyPress={e=>e.key==="Enter" && handleSendMessage(inputValue)} disabled={isProcessing || audioRecorder.isRecording} />
          {assistanceMode==='voice' && (
            <Button onClick={handleVoiceInput} disabled={isProcessing} size="icon" variant={audioRecorder.isRecording?"destructive":"outline"} className={cn(audioRecorder.isRecording && "animate-pulse")}>
              {audioRecorder.isRecording?<MicOff className="h-4 w-4"/>:<Mic className="h-4 w-4"/>}
            </Button>
          )}
          <Button onClick={()=>handleSendMessage(inputValue)} disabled={isProcessing || !inputValue.trim() || audioRecorder.isRecording} size="icon"><Send className="h-4 w-4"/></Button>
          {isPlayingAudio && <Button size="icon" variant="ghost" disabled><Volume2 className="h-4 w-4 animate-pulse"/></Button>}
        </div>

        {/* Audio element */}
        <audio ref={audioRef} className="hidden"/>
        {audioRecorder.isRecording && <div className="text-center"><Badge variant="destructive" className="animate-pulse">Recording... {Math.round(audioRecorder.duration/1000)}s</Badge></div>}
      </CardContent>
    </Card>
  );
}
