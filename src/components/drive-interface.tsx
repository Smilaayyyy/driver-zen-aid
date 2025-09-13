import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Navigation, 
  AlertTriangle, 
  CloudRain, 
  Construction, 
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Car,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DriveAlert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
  location?: string;
  timestamp: Date;
  requiresAction?: boolean;
  actionText?: string;
}

interface DriveInterfaceProps {
  isListening: boolean;
  language: string;
  assistanceMode: 'voice' | 'chat';
}

export function DriveInterface({ isListening, language, assistanceMode }: DriveInterfaceProps) {
  const [isDriving, setIsDriving] = useState(false);
  const [alerts, setAlerts] = useState<DriveAlert[]>([]);
  const [currentLocation, setCurrentLocation] = useState("Sector 18, Noida");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [isPlayingAlert, setIsPlayingAlert] = useState(false);

  // Play TTS alert
  const playAlert = async (text: string) => {
    if (assistanceMode !== 'voice' || !audioEnabled) return;
    
    try {
      setIsPlayingAlert(true);
      // For demo, using Web Speech API as fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setIsPlayingAlert(false);
      }
    } catch (error) {
      console.error('Alert TTS failed:', error);
      setIsPlayingAlert(false);
    }
  };

  // Mock GPS and alert system
  useEffect(() => {
    if (isDriving) {
      // Simulate speed changes
      const speedInterval = setInterval(() => {
        setSpeed(prev => Math.max(0, prev + (Math.random() - 0.5) * 10));
      }, 2000);

      // Simulate periodic alerts
      const alertInterval = setInterval(() => {
        const mockAlerts: DriveAlert[] = [
          {
            id: Date.now().toString(),
            type: "warning",
            title: "Heavy Traffic Ahead",
            message: "Traffic congestion detected 2km ahead on NH-24",
            location: "NH-24, Ghaziabad",
            timestamp: new Date(),
            requiresAction: true,
            actionText: "Find alternate route"
          },
          {
            id: (Date.now() + 1).toString(),
            type: "danger",
            title: "Rough Road Detected",
            message: "Poor road conditions ahead. Reduce speed for vehicle safety",
            location: "Link Road, Sector 15",
            timestamp: new Date(),
            requiresAction: true,
            actionText: "Slow down"
          },
          {
            id: (Date.now() + 2).toString(),
            type: "info",
            title: "Weather Update",
            message: "Light rain expected in 30 minutes",
            timestamp: new Date()
          }
        ];

        // Add random alert
        const randomAlert = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
        setAlerts(prev => [randomAlert, ...prev.slice(0, 4)]);

        // Simulate TTS announcement
        if (audioEnabled && randomAlert.requiresAction) {
          playAlert(randomAlert.message);
        }
      }, 8000);

      return () => {
        clearInterval(speedInterval);
        clearInterval(alertInterval);
      };
    }
  }, [isDriving, audioEnabled]);

  const toggleDriving = () => {
    setIsDriving(!isDriving);
    if (!isDriving) {
      setSpeed(25);
      // Initial driving alert
      setAlerts([{
        id: "initial",
        type: "info",
        title: "Drive Mode Activated",
        message: "Voice commands are now active. I'll monitor road conditions and provide alerts.",
        timestamp: new Date()
      }]);
    } else {
      setSpeed(0);
      setAlerts([]);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <CloudRain className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-driver-danger text-driver-danger";
      case "warning":
        return "border-driver-warning text-driver-warning";
      default:
        return "border-driver-primary text-driver-primary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Drive Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-driver-primary" />
              Drive Mode
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  Voice Active
                </Badge>
              )}
              {isPlayingAlert && (
                <Badge variant="secondary" className="animate-pulse">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Alert Playing
                </Badge>
              )}
            </div>
            <Button
              onClick={toggleDriving}
              variant={isDriving ? "destructive" : "default"}
              className={cn(
                "transition-all duration-200",
                isDriving && "bg-driver-danger hover:bg-driver-danger/80"
              )}
            >
              {isDriving ? "Stop Driving" : "Start Driving"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Current Location
              </div>
              <p className="font-medium">{currentLocation}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Speed
              </div>
              <p className="font-medium text-2xl">
                {Math.round(speed)} <span className="text-sm text-muted-foreground">km/h</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                Audio Alerts
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="w-full"
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Off
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Navigation:</p>
              <p className="text-muted-foreground">"Find alternate route"</p>
              <p className="text-muted-foreground">"What's the traffic like?"</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Safety:</p>
              <p className="text-muted-foreground">"Report road hazard"</p>
              <p className="text-muted-foreground">"Check weather conditions"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-driver-warning" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={cn("transition-all duration-200", getAlertColor(alert.type))}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="space-y-1">
                      <div className="font-medium">{alert.title}</div>
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                      {alert.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {alert.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp.toTimeString().slice(0, 5)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.requiresAction && alert.actionText && (
                      <Button size="sm" variant="outline" className="text-xs">
                        {alert.actionText}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Drive Mode Instructions */}
      {!isDriving && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Car className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-medium">Ready to Drive?</h3>
              <p className="text-sm text-muted-foreground">
                Click "Start Driving" to activate real-time alerts for traffic, weather, road conditions, and delivery updates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}