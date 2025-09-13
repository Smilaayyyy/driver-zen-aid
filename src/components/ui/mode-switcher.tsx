import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageCircle, Car, FileText, Mic, MicOff } from "lucide-react";

export type AppMode = "chat" | "drive" | "form";

interface ModeSwitcherProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isListening?: boolean;
  onToggleListening?: () => void;
}

export function ModeSwitcher({ 
  currentMode, 
  onModeChange, 
  isListening = false,
  onToggleListening 
}: ModeSwitcherProps) {
  const modes = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "drive" as const, label: "Drive", icon: Car },
    { id: "form" as const, label: "Forms", icon: FileText },
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-xl border">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <Button
            key={mode.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isActive && "bg-driver-primary text-white shadow-lg"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </Button>
        );
      })}
      
      <div className="h-6 w-px bg-border mx-2" />
      
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={onToggleListening}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          isListening && "animate-pulse bg-driver-danger"
        )}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isListening ? "Stop" : "Voice"}
        </span>
      </Button>
    </div>
  );
}