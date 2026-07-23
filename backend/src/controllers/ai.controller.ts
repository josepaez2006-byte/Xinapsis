import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * POST /api/ai/dictado
 * Proxy seguro hacia Gemini. La API Key nunca sale del servidor.
 * Body: { transcript: string, buildPrompt?: string }
 */
export const processDictado = async (req: AuthRequest, res: Response) => {
  const { transcript, prompt } = req.body as { transcript?: string; prompt?: string };

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ message: 'transcript is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured in environment variables.');
    return res.status(503).json({ message: 'AI service is not configured on the server.' });
  }

  const finalPrompt = prompt || buildDefaultDictadoPrompt(transcript);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('[AI Proxy] Gemini error:', errBody);
      return res.status(502).json({ message: 'Error communicating with AI service.' });
    }

    const data = await response.json() as any;
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      return res.status(502).json({ message: 'Empty response from AI service.' });
    }

    // Parsear el JSON devuelto por Gemini y reenviarlo al cliente
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error('[AI Proxy] Unexpected error:', err);
    return res.status(500).json({ message: err.message || 'Unexpected error in AI proxy.' });
  }
};

function buildDefaultDictadoPrompt(transcript: string): string {
  return `
Eres un asistente médico clínico. Analiza el siguiente dictado de un médico y extrae
la información clasificada en cuatro campos:
- "reason": motivo principal de consulta (breve, 1-2 oraciones).
- "symptoms": síntomas y evolución del cuadro clínico (más detallado).
- "findings": array de strings, cada uno con un hallazgo al examen físico.
- "diagnoses": array de objetos {"description": string, "codeCIE10": string}.
  Intenta inferir el código CIE-10 más probable; si no sabes, deja "codeCIE10" vacío.

Dictado del médico:
"${transcript}"

Devuelve ÚNICAMENTE un JSON válido con las llaves: reason, symptoms, findings, diagnoses.
`;
}
