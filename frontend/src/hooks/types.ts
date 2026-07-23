// ============================================================
//  useVoiceToText – Tipos compartidos (Xinapsis)
// ============================================================

/** Estado que devuelve el hook */
export interface VoiceToTextState<T> {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  result: T | null;
  error: string | null;
  isSupported: boolean;
}

/** Acciones que expone el hook */
export interface VoiceToTextActions {
  toggleRecording: () => void;
  processText: (text: string) => Promise<void>;
  reset: () => void;
}

/** Opciones de configuración del hook */
export interface UseVoiceToTextOptions<T> {
  language?: string;
  buildPrompt: (transcript: string) => string;
  parseResponse: (json: Record<string, unknown>) => T;
  initialResult?: T | null;
}
