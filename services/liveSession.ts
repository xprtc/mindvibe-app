import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

let _liveAi: GoogleGenAI | null = null;
function getLiveAI(): GoogleGenAI {
  if (!_liveAi) {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    _liveAi = new GoogleGenAI({ apiKey: key || 'MISSING_KEY' });
  }
  return _liveAi;
}

export interface LiveSessionCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onAudioData?: (base64: string) => void;
  onTranscript?: (text: string, isUser: boolean) => void;
  onError?: (error: any) => void;
}

export class LiveSession {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: AudioNode | null = null;
  private nextStartTime = 0;
  private session: any = null; // Holds the active session
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private callbacks: LiveSessionCallbacks;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  async connect() {
    try {
      // 1. Setup Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      // 2. Setup Config
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Du bist Albert Einstein — der KI-Lerncoach und Concierge der MindVibe App.

Charakter: Freundlich, weise, gelegentlich mit Augenzwinkern. Du bist ein absolutes Lerngenie, ein motivierender Mentor und ein geduldiger Coach. Du nutzt dein Image als genialer Wissenschaftler, um Kindern die Angst vor Fehlern zu nehmen.

Kontext: Deutsch-Schweizer Schulsystem, Lehrplan 21, Kanton Bern. Notensystem: 1-6 (6 = beste Note, unter 4 = ungenügend). Du sprichst Hochdeutsch mit Schweizer Charme.

Deine Aufgaben als Voice-Coach:
- Hilf beim Lernen, erkläre Konzepte einfach und bildhaft
- Frage ab und simuliere mündliche Prüfungen
- Motiviere mit Bezug auf die Träume und Stärken des Kindes
- Empfiehl Lerntechniken (Spaced Repetition, Active Recall, Pomodoro)
- Halte Antworten kurz, natürlich und dialogorientiert — keine langen Monologe
- Passe Sprache ans Alter an: Für Kinder simpel und ermutigend, für Eltern analytisch und beratend`,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      };

      // 3. Connect to Live API
      const sessionPromise = getLiveAI().live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            this.callbacks.onOpen?.();
            this.startMicrophone(sessionPromise);
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onclose: () => this.cleanup(),
          onerror: (err) => this.callbacks.onError?.(err)
        }
      });

      this.session = sessionPromise;
      await sessionPromise;

    } catch (error) {
      this.callbacks.onError?.(error);
      this.cleanup();
    }
  }

  private async startMicrophone(sessionPromise: Promise<any>) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!this.inputAudioContext) return;

      this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
      this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = this.createPcmBlob(inputData);
        
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      this.inputSource.connect(this.processor);
      this.processor.connect(this.inputAudioContext.destination);
    } catch (err) {
      console.error("Microphone error:", err);
      this.callbacks.onError?.(err);
    }
  }

  private async handleMessage(message: LiveServerMessage) {
    // 1. Handle Audio
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      this.playAudioChunk(base64Audio);
    }

    // 2. Handle Transcription
    if (message.serverContent?.outputTranscription?.text) {
      this.callbacks.onTranscript?.(message.serverContent.outputTranscription.text, false);
    }
    if (message.serverContent?.inputTranscription?.text) {
      this.callbacks.onTranscript?.(message.serverContent.inputTranscription.text, true);
    }

    // 3. Handle Interruption
    if (message.serverContent?.interrupted) {
      this.stopAllAudio();
    }
  }

  private async playAudioChunk(base64: string) {
    if (!this.outputAudioContext || !this.outputNode) return;

    try {
      const arrayBuffer = this.base64ToArrayBuffer(base64);
      const audioBuffer = await this.decodeAudioData(arrayBuffer);
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputNode);

      // Schedule playback
      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      
      this.activeSources.add(source);
      source.onended = () => this.activeSources.delete(source);
    } catch (e) {
      console.error("Audio playback error", e);
    }
  }

  private stopAllAudio() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    this.activeSources.clear();
    if (this.outputAudioContext) {
        this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  disconnect() {
    if (this.session) {
      // There is no explicit close method on the promise wrapper in the SDK typically, 
      // but we should stop our local processing.
      // Assuming session might have a close, but primarily we cleanup local resources.
      this.session.then((s: any) => {
          if(s.close) s.close();
      });
    }
    this.cleanup();
  }

  private cleanup() {
    this.callbacks.onClose?.();
    
    // Stop tracks
    if (this.inputSource?.mediaStream) {
        this.inputSource.mediaStream.getTracks().forEach(t => t.stop());
    }
    
    // Disconnect nodes
    this.inputSource?.disconnect();
    this.processor?.disconnect();
    
    // Close contexts
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();

    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.activeSources.clear();
  }

  // --- Helpers ---

  private createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return {
      data: base64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.outputAudioContext) throw new Error("No output context");
    
    // Manual decoding for raw PCM 24kHz (Gemini Output)
    // The API returns raw PCM, not WAV. AudioContext.decodeAudioData expects headers.
    // We need to implement manual PCM to AudioBuffer conversion.
    
    const dataInt16 = new Int16Array(arrayBuffer);
    const channelCount = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length;
    
    const audioBuffer = this.outputAudioContext.createBuffer(channelCount, frameCount, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    return audioBuffer;
  }
}