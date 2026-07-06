/**
 * Service to interact with the standalone Python FastAPI voice service (ASR + TTS)
 * using the Meta MMS model family.
 */

// Helper to convert base64 string to a Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Transcribes Wolof audio using the standalone /asr endpoint.
 * Falls back silently (returns empty transcript or throws an error caught by caller) 
 * if the service is unreachable.
 */
export async function transcribeWolofAudio(
  audioBlob: Blob
): Promise<{ text: string; confidence: number }> {
  const baseUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_VOICE_SERVICE_URL) || 'http://localhost:8000').replace(/\/$/, '');
  
  try {
    const formData = new FormData();
    // Use an audio filename with appropriate extension (e.g. webm)
    formData.append('file', audioBlob, 'audio.webm');

    const response = await fetch(`${baseUrl}/asr`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ASR server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || '',
      confidence: typeof data.confidence === 'number' ? data.confidence : 1.0,
    };
  } catch (error) {
    console.warn('Wolof ASR voice service unavailable. Falling back silently to text entry.', error);
    // Return empty results to trigger silent text fallback
    return { text: '', confidence: 0.0 };
  }
}

/**
 * Synthesizes Wolof speech using the standalone /tts endpoint.
 * Normalizes input text on the server before synthesis.
 * Returns a Blob containing the WAV audio if successful, or null if the service is unavailable.
 */
export async function synthesizeWolofSpeech(text: string): Promise<Blob | null> {
  const baseUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_VOICE_SERVICE_URL) || 'http://localhost:8000').replace(/\/$/, '');

  try {
    const formData = new FormData();
    formData.append('text', text);

    const response = await fetch(`${baseUrl}/tts`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`TTS server returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.audio) {
      throw new Error('TTS response did not contain audio data');
    }

    // Convert base64 WAV audio data to Blob
    return base64ToBlob(data.audio, 'audio/wav');
  } catch (error) {
    console.warn('Wolof TTS voice service unavailable. Falling back silently.', error);
    return null;
  }
}
