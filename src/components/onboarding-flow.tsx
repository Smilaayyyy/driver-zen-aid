import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Languages, 
  MessageSquare, 
  Mic, 
  User, 
  Phone,
  Check
} from "lucide-react";

export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export type AssistanceMode = 'voice' | 'chat';

interface OnboardingData {
  name: string;
  phone: string;
  language: Language;
  assistanceMode: AssistanceMode;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to Driver Assistant",
    subtitle: "Your AI-powered driving companion",
    step1: "Personal Information",
    step2: "Language Preference", 
    step3: "Assistance Mode",
    name: "Full Name",
    phone: "Mobile Number",
    selectLanguage: "Select your preferred language",
    selectMode: "Choose your assistance preference",
    voiceMode: "Voice Assistant",
    voiceModeDesc: "Hands-free interaction with voice commands",
    chatMode: "Chat Assistant", 
    chatModeDesc: "Text-based interaction and responses",
    continue: "Continue",
    getStarted: "Get Started",
    enterName: "Enter your full name",
    enterPhone: "Enter your mobile number"
  },
  hi: {
    welcome: "ड्राइवर असिस्टेंट में आपका स्वागत है",
    subtitle: "आपका AI-संचालित ड्राइविंग साथी",
    step1: "व्यक्तिगत जानकारी",
    step2: "भाषा प्राथमिकता",
    step3: "सहायता मोड",
    name: "पूरा नाम",
    phone: "मोबाइल नंबर", 
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    selectMode: "अपनी सहायता प्राथमिकता चुनें",
    voiceMode: "वॉयस असिस्टेंट",
    voiceModeDesc: "वॉयस कमांड के साथ हैंड्स-फ्री इंटरैक्शन",
    chatMode: "चैट असिस्टेंट",
    chatModeDesc: "टेक्स्ट-आधारित इंटरैक्शन और प्रतिक्रियाएं",
    continue: "जारी रखें",
    getStarted: "शुरू करें",
    enterName: "अपना पूरा नाम दर्ज करें",
    enterPhone: "अपना मोबाइल नंबर दर्ज करें"
  }
};

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    assistanceMode: 'voice' as AssistanceMode
  });

  const t = TRANSLATIONS[selectedLanguage.code as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        name: formData.name,
        phone: formData.phone,
        language: selectedLanguage,
        assistanceMode: formData.assistanceMode
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.phone.trim();
      case 2:
        return selectedLanguage;
      case 3:
        return formData.assistanceMode;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-driver-primary/5 to-driver-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-driver-primary">
            {t.welcome}
          </CardTitle>
          <p className="text-muted-foreground">{t.subtitle}</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-2 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-driver-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">
                  <User className="h-3 w-3 mr-1" />
                  {t.step1}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.enterName}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t.enterPhone}
                  type="tel"
                />
              </div>
            </div>
          )}

          {/* Step 2: Language Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">
                  <Languages className="h-3 w-3 mr-1" />
                  {t.step2}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {t.selectLanguage}
              </p>
              
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <Button
                    key={language.code}
                    variant={selectedLanguage.code === language.code ? "default" : "outline"}
                    onClick={() => setSelectedLanguage(language)}
                    className="h-auto p-3 flex flex-col items-start"
                  >
                    <div className="font-medium text-sm">{language.name}</div>
                    <div className="text-xs opacity-70">{language.nativeName}</div>
                    {selectedLanguage.code === language.code && (
                      <Check className="h-3 w-3 ml-auto" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Assistance Mode */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {t.step3}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {t.selectMode}
              </p>
              
              <RadioGroup
                value={formData.assistanceMode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assistanceMode: value as AssistanceMode }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="voice" id="voice" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-driver-primary" />
                      <Label htmlFor="voice" className="font-medium">
                        {t.voiceMode}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.voiceModeDesc}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="chat" id="chat" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-driver-primary" />
                      <Label htmlFor="chat" className="font-medium">
                        {t.chatMode}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.chatModeDesc}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button 
            onClick={handleNext}
            disabled={!isStepValid()}
            className="w-full"
            size="lg"
          >
            {currentStep === 3 ? t.getStarted : t.continue}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}