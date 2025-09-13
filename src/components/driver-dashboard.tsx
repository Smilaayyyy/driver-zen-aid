import { useState } from "react";
import { ModeSwitcher, AppMode } from "@/components/ui/mode-switcher";
import { FinancialCard } from "@/components/ui/financial-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  AlertTriangle, 
  CreditCard, 
  Shield, 
  TrendingUp,
  MapPin,
  Clock,
  FileText,
  MessageSquare,
  Truck
} from "lucide-react";
import { ChatInterface } from "./chat-interface";
import { DriveInterface } from "./drive-interface";
import { FormInterface } from "./form-interface";
import type { Language, AssistanceMode } from "./onboarding-flow";

// Mock data as provided
const mockData = {
  earnings: {
    today: { gross: 1400, expenses: 200, penalty: 50, net: 1150 },
    yesterday: { gross: 1200, expenses: 150, penalty: 100, net: 950 },
    this_week: { gross: 6500, expenses: 900, penalty: 300, net: 5300 },
    last_week: { gross: 5800, expenses: 800, penalty: 250, net: 4750 }
  },
  penalties: { late_delivery: "₹200", traffic_violation: "₹500", other: "₹100" },
  loan: { total_balance: "₹50,000", next_installment: "₹5,000", due_date: "2025-09-25" },
  insurance: { 
    policy_number: "INS123456789", 
    coverage: "Vehicle and third-party liability", 
    expiry: "2025-12-31", 
    premium_status: "Paid" 
  }
};

export function DriverDashboard() {
  const [currentMode, setCurrentMode] = useState<AppMode>("chat");
  const [isListening, setIsListening] = useState(false);
  
  // These would typically come from user settings/context
  const userLanguage: Language = { code: 'en', name: 'English', nativeName: 'English' };
  const userAssistanceMode: AssistanceMode = 'voice';

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleToggleListening = () => {
    setIsListening(!isListening);
  };

  const renderModeInterface = () => {
    switch (currentMode) {
      case "chat":
        return (
          <ChatInterface 
            mockData={mockData} 
            isListening={isListening}
            language={userLanguage.code}
            assistanceMode={userAssistanceMode}
          />
        );
      case "drive":
        return (
          <DriveInterface 
            isListening={isListening}
            language={userLanguage.code}
            assistanceMode={userAssistanceMode}
          />
        );
      case "form":
        return (
          <FormInterface 
            isListening={isListening}
            language={userLanguage.code}
            assistanceMode={userAssistanceMode}
          />
        );
      default:
        return (
          <ChatInterface 
            mockData={mockData} 
            isListening={isListening}
            language={userLanguage.code}
            assistanceMode={userAssistanceMode}
          />
        );
    }
  };

  const todayNet = mockData.earnings.today.net;
  const yesterdayNet = mockData.earnings.yesterday.net;
  const trendPercentage = Math.round(((todayNet - yesterdayNet) / yesterdayNet) * 100);
  const trend = todayNet > yesterdayNet ? "up" : todayNet < yesterdayNet ? "down" : "neutral";

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Driver Assistant
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered driving companion
          </p>
        </div>
        
        <ModeSwitcher 
          currentMode={currentMode}
          onModeChange={handleModeChange}
          isListening={isListening}
          onToggleListening={handleToggleListening}
        />
      </div>

      {/* Financial Overview - Only show in chat mode */}
      {currentMode === "chat" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialCard
            title="Today's Earnings"
            amount={mockData.earnings.today.net}
            variant="success"
            icon={<Wallet className="h-4 w-4" />}
            trend={trend}
            trendPercentage={Math.abs(trendPercentage)}
            subtitle="Net after expenses"
          />
          
          <FinancialCard
            title="This Week"
            amount={mockData.earnings.this_week.net}
            variant="default"
            icon={<TrendingUp className="h-4 w-4" />}
            subtitle="Total net earnings"
          />
          
          <FinancialCard
            title="Penalties"
            amount={mockData.earnings.today.penalty + mockData.earnings.this_week.penalty}
            variant="danger"
            icon={<AlertTriangle className="h-4 w-4" />}
            subtitle="This week total"
          />
          
          <FinancialCard
            title="Loan Balance"
            amount={50000}
            variant="warning"
            icon={<CreditCard className="h-4 w-4" />}
            subtitle="Next: ₹5,000 due"
          />
        </div>
      )}

      {/* Quick Status Cards - Only show in chat mode */}
      {currentMode === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Status</CardTitle>
              <Shield className="h-4 w-4 text-driver-success" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">{mockData.insurance.policy_number}</p>
                </div>
                <Badge variant="outline" className="text-driver-success border-driver-success">
                  {mockData.insurance.premium_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-driver-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-driver-accent" />
                  <span>Last delivery: Sector 18, Noida</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="h-3 w-3 text-driver-primary" />
                  <span>Status: Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mode-specific Interface */}
      <div className="flex-1">
        {renderModeInterface()}
      </div>
    </div>
  );
}