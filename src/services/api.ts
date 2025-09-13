// API service for FastAPI backend integration
const API_BASE_URL = 'https://your-ngrok-url';

export interface STTResponse {
  transcribed_text: string;
}

export interface IntentResponse {
  intent: string;
  answer: string;
  alert?: string;
  alert_audio?: boolean;
  form_fields?: Record<string, string>;
  tips?: string;
  tips_audio?: boolean;
  tts_ready?: string;
}

export interface DocumentResponse {
  parsed_data: Record<string, any>;
  extracted_fields: Record<string, string>;
  document_type: string;
}

class ApiService {
  private apiBaseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.apiBaseUrl = baseUrl;
  }

  // Speech to Text
  async speechToText(audioFile: File): Promise<STTResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${this.apiBaseUrl}/stt`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('STT request failed');
    }

    return await response.json();
  }

  // Intent Detection
  async processIntent(text: string, mode: 'chat' | 'drive' | 'form'): Promise<IntentResponse> {
    const response = await fetch(`${this.apiBaseUrl}/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, mode }),
    });

    if (!response.ok) {
      throw new Error('Intent processing failed');
    }

    return await response.json();
  }

  // Document Processing
  async processDocument(file: File): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${this.apiBaseUrl}/financial_doc`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Document processing failed');
    }

    return await response.json();
  }

  // Text to Speech
  async textToSpeech(text: string): Promise<Blob> {
    const response = await fetch(`${this.apiBaseUrl}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    return await response.blob();
  }
}

export const apiService = new ApiService();