// ============================================================
//  useVoiceToText – Hook reutilizable (Xinapsis)
//
//  Llama al backend proxy /api/ai/dictado en lugar de
//  llamar a Gemini directamente desde el frontend.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import type {
  UseVoiceToTextOptions,
  VoiceToTextState,
  VoiceToTextActions,
} from './types';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceToText<T>(
  options: UseVoiceToTextOptions<T>
): VoiceToTextState<T> & VoiceToTextActions {
  const {
    language = 'es-ES',
    buildPrompt,
    parseResponse,
    initialResult = null,
  } = options;

  const [isRecording, setIsRecording]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [result, setResult]             = useState<T | null>(initialResult);
  const [error, setError]               = useState<string | null>(null);
  const [isSupported, setIsSupported]   = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef  = useRef('');

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Tu navegador no soporta la Web Speech API. Usa Chrome o Edge.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      transcriptRef.current = current;
      setTranscript(current);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[useVoiceToText] error:', event.error);
      setError(`Error de micrófono: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => { recognition.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Llama al proxy del backend para procesar el dictado con Gemini
  const processText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsProcessing(true);
      setError(null);

      try {
        // El prompt se construye en el frontend pero el API Key queda en el servidor
        const prompt = buildPrompt(text);
        const parsed = await api.post<Record<string, unknown>>('/ai/dictado', {
          transcript: text,
          prompt,
        });
        setResult(parseResponse(parsed));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[useVoiceToText] error IA:', err);
        setError(`Error procesando con IA: ${msg}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [buildPrompt, parseResponse]
  );

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      void processText(transcriptRef.current);
    } else {
      transcriptRef.current = '';
      setTranscript('');
      setResult(initialResult);
      setError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('[useVoiceToText] no se pudo iniciar:', e);
      }
    }
  }, [isRecording, initialResult, processText]);

  const reset = useCallback(() => {
    if (isRecording) recognitionRef.current?.stop();
    transcriptRef.current = '';
    setTranscript('');
    setResult(initialResult);
    setError(null);
    setIsRecording(false);
    setIsProcessing(false);
  }, [isRecording, initialResult]);

  return {
    isRecording, isProcessing, transcript,
    result, error, isSupported,
    toggleRecording, processText, reset,
  };
}
