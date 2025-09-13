import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

export interface UploadedDocument {
  id: string;
  file: File;
  type: 'financial' | 'insurance' | 'loan' | 'tax' | 'earnings';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  parsedData?: any;
  extractedFields?: Record<string, string>;
  error?: string;
}

interface DocumentUploadProps {
  onDocumentProcessed: (document: UploadedDocument) => void;
  maxFiles?: number;
}

const SUPPORTED_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF' },
  'image/jpeg': { icon: Image, label: 'JPEG' },
  'image/png': { icon: Image, label: 'PNG' },
  'image/webp': { icon: Image, label: 'WebP' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'DOCX' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, label: 'XLSX' }
};

const DOCUMENT_TYPES = [
  { value: 'financial', label: 'Financial Statement', color: 'bg-green-500' },
  { value: 'insurance', label: 'Insurance Policy', color: 'bg-blue-500' },
  { value: 'loan', label: 'Loan Document', color: 'bg-orange-500' },
  { value: 'tax', label: 'Tax Document', color: 'bg-purple-500' },
  { value: 'earnings', label: 'Earnings Report', color: 'bg-teal-500' }
];

export function DocumentUpload({ onDocumentProcessed, maxFiles = 5 }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const processDocument = async (file: File, documentType: string) => {
    const documentId = Date.now().toString();
    
    const newDocument: UploadedDocument = {
      id: documentId,
      file,
      type: documentType as any,
      status: 'uploading',
      progress: 0
    };

    setDocuments(prev => [...prev, newDocument]);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, progress: i, status: i === 100 ? 'processing' : 'uploading' }
            : doc
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Process document via API
      const result = await apiService.processDocument(file);
      
      const completedDocument: UploadedDocument = {
        ...newDocument,
        status: 'completed',
        progress: 100,
        parsedData: result.parsed_data,
        extractedFields: result.extracted_fields
      };

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? completedDocument : doc
      ));

      onDocumentProcessed(completedDocument);

    } catch (error) {
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }
          : doc
      ));
    }
  };

  const handleFileSelect = useCallback((files: FileList, documentType: string) => {
    if (documents.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        alert(`File ${file.name} is too large. Max size is 20MB.`);
        return;
      }

      if (!Object.keys(SUPPORTED_TYPES).includes(file.type)) {
        alert(`File type ${file.type} is not supported.`);
        return;
      }

      processDocument(file, documentType);
    });
  }, [documents.length, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files, documentType);
  }, [handleFileSelect]);

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-driver-primary border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => (
          <Card 
            key={docType.value}
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer hover:bg-muted/50",
              isDragOver && "border-driver-primary bg-driver-primary/5"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => handleDrop(e, docType.value)}
          >
            <CardHeader className="text-center pb-2">
              <div className={cn("w-12 h-12 rounded-lg mx-auto flex items-center justify-center", docType.color)}>
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-sm">{docType.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                multiple
                accept={Object.keys(SUPPORTED_TYPES).join(',')}
                onChange={(e) => e.target.files && handleFileSelect(e.target.files, docType.value)}
                className="hidden"
                id={`upload-${docType.value}`}
              />
              <label htmlFor={`upload-${docType.value}`}>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {documents.map((document) => {
                  const fileTypeInfo = SUPPORTED_TYPES[document.file.type as keyof typeof SUPPORTED_TYPES];
                  const docTypeInfo = DOCUMENT_TYPES.find(type => type.value === document.type);
                  
                  return (
                    <div key={document.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {fileTypeInfo && <fileTypeInfo.icon className="h-8 w-8 text-muted-foreground" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{document.file.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {docTypeInfo?.label}
                          </Badge>
                          {getStatusIcon(document.status)}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{fileTypeInfo?.label}</span>
                          <span>•</span>
                          <span>{Math.round(document.file.size / 1024)} KB</span>
                        </div>
                        
                        {document.status === 'uploading' || document.status === 'processing' ? (
                          <Progress value={document.progress} className="mt-2 h-1" />
                        ) : null}
                        
                        {document.error && (
                          <p className="text-xs text-red-500 mt-1">{document.error}</p>
                        )}
                        
                        {document.extractedFields && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(document.extractedFields).slice(0, 3).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {document.status === 'completed' && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => removeDocument(document.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}