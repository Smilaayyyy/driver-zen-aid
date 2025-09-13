import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Camera,
  CreditCard,
  Car,
  User,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormField {
  id: string;
  label: string;
  value: string;
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

interface DocumentUpload {
  id: string;
  type: string;
  name: string;
  status: "pending" | "processing" | "valid" | "invalid";
  issues?: string[];
  extractedData?: Record<string, string>;
}

interface FormInterfaceProps {
  isListening: boolean;
}

export function FormInterface({ isListening }: FormInterfaceProps) {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: "name", label: "Full Name", value: "", isValid: false },
    { id: "phone", label: "Phone Number", value: "", isValid: false },
    { id: "email", label: "Email Address", value: "", isValid: false },
    { id: "address", label: "Address", value: "", isValid: false },
    { id: "aadhar", label: "Aadhar Number", value: "", isValid: false },
    { id: "pan", label: "PAN Number", value: "", isValid: false },
  ]);

  const documentTypes = [
    { id: "aadhar", label: "Aadhar Card", icon: User, required: true },
    { id: "pan", label: "PAN Card", icon: CreditCard, required: true },
    { id: "license", label: "Driving License", icon: Car, required: true },
    { id: "rc", label: "Vehicle RC", icon: FileText, required: true },
    { id: "insurance", label: "Insurance Policy", icon: FileText, required: false },
  ];

  // Mock document processing
  const handleDocumentUpload = (type: string) => {
    const newDoc: DocumentUpload = {
      id: Date.now().toString(),
      type,
      name: `${type}_document.jpg`,
      status: "processing",
    };

    setDocuments(prev => [...prev, newDoc]);

    // Simulate processing
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === newDoc.id 
          ? {
              ...doc,
              status: Math.random() > 0.3 ? "valid" : "invalid",
              issues: Math.random() > 0.3 ? [] : [
                "Image is blurry",
                "Document corners not visible",
                "Poor lighting"
              ],
              extractedData: type === "aadhar" ? {
                name: "John Doe",
                number: "1234 5678 9012",
                address: "123 Main St, Delhi"
              } : type === "pan" ? {
                name: "John Doe",
                number: "ABCDE1234F",
                dob: "01/01/1990"
              } : {}
            }
          : doc
      ));

      // Simulate TTS feedback
      if (isListening) {
        console.log("TTS: Document processed. Please check for any issues highlighted.");
      }
    }, 2000);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormFields(prev => prev.map(field => {
      if (field.id === fieldId) {
        let isValid = false;
        let error = "";
        let suggestion = "";

        // Validation logic
        switch (fieldId) {
          case "phone":
            isValid = /^\d{10}$/.test(value);
            if (!isValid && value) error = "Phone number must be 10 digits";
            break;
          case "email":
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (!isValid && value) error = "Please enter a valid email";
            break;
          case "aadhar":
            isValid = /^\d{4}\s?\d{4}\s?\d{4}$/.test(value);
            if (!isValid && value) error = "Aadhar should be 12 digits";
            suggestion = "Format: 1234 5678 9012";
            break;
          case "pan":
            isValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase());
            if (!isValid && value) error = "Invalid PAN format";
            suggestion = "Format: ABCDE1234F";
            break;
          case "name":
            isValid = value.length >= 2;
            if (!isValid && value) error = "Name too short";
            break;
          case "address":
            isValid = value.length >= 10;
            if (!isValid && value) error = "Please enter complete address";
            break;
        }

        return { ...field, value, isValid, error, suggestion };
      }
      return field;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-driver-success" />;
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-driver-danger" />;
      case "processing":
        return <div className="h-4 w-4 border-2 border-driver-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <Upload className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "border-driver-success bg-driver-success/5";
      case "invalid":
        return "border-driver-danger bg-driver-danger/5";
      case "processing":
        return "border-driver-primary bg-driver-primary/5";
      default:
        return "border-border";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-driver-primary" />
            Form Assistant
            {isListening && (
              <Badge variant="destructive" className="animate-pulse">
                Voice Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="forms">Personal Info</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Upload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload your documents for verification. I'll help detect issues and extract information.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentTypes.map((docType) => {
                  const Icon = docType.icon;
                  const uploaded = documents.find(doc => doc.type === docType.id);
                  
                  return (
                    <Card 
                      key={docType.id} 
                      className={cn(
                        "transition-all duration-200 cursor-pointer hover:shadow-md",
                        uploaded ? getStatusColor(uploaded.status) : "border-dashed"
                      )}
                      onClick={() => !uploaded && handleDocumentUpload(docType.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-driver-primary" />
                            <div>
                              <p className="font-medium text-sm">{docType.label}</p>
                              {docType.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                          </div>
                          {getStatusIcon(uploaded?.status || "pending")}
                        </div>
                        
                        {uploaded?.issues && uploaded.issues.length > 0 && (
                          <Alert className="mt-3 border-driver-warning">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Issues found: {uploaded.issues.join(", ")}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {uploaded?.extractedData && (
                          <div className="mt-3 p-2 bg-muted rounded text-xs space-y-1">
                            <p className="font-medium">Extracted Data:</p>
                            {Object.entries(uploaded.extractedData).map(([key, value]) => (
                              <p key={key} className="text-muted-foreground">
                                {key}: {value}
                              </p>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill out your personal details. I'll provide suggestions and validate as you type.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="flex items-center gap-2">
                      {field.label}
                      {field.isValid && (
                        <CheckCircle className="h-4 w-4 text-driver-success" />
                      )}
                    </Label>
                    <Input
                      id={field.id}
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={cn(
                        field.error && "border-driver-danger",
                        field.isValid && "border-driver-success"
                      )}
                    />
                    {field.suggestion && (
                      <p className="text-xs text-muted-foreground">
                        💡 {field.suggestion}
                      </p>
                    )}
                    {field.error && (
                      <p className="text-xs text-driver-danger">
                        {field.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <Button className="w-full bg-driver-primary hover:bg-driver-primary/80">
                Save Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Voice Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="h-5 w-5" />
            Voice Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Document Upload:</p>
              <p className="text-muted-foreground">"Upload Aadhar card"</p>
              <p className="text-muted-foreground">"Check document status"</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Form Filling:</p>
              <p className="text-muted-foreground">"Fill my name as..."</p>
              <p className="text-muted-foreground">"What's the format for PAN?"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}