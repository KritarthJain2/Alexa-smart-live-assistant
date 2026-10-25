/**
 * Speech synthesis (Text-to-Speech) and Speech Recognition (Speech-to-Text)
 * for Alexa+ Smart Live Assistant simulated experience.
 */

// Strip markdown characters from speech for natural audio readout
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[#*_`~>\[\]\(\)]/g, '')
    .replace(/•/g, ',')
    .replace(/\n+/g, '. ')
    .trim();
}

export function speakAlexaResponse(text: string, rate: number = 1.0): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing utterance
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.rate = rate;
    utterance.pitch = 1.05; // Friendly, clear Alexa-like tone

    // Try to pick an English voice (prefer natural or Google or female voice if available)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')) && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Check speech recognition support
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startSpeechRecognition(
  onTranscript: (text: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser.');
    return { stop: () => {} };
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognitionClass();

  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'en-US';

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      onTranscript(transcript);
    }
  };

  recognizer.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  recognizer.onend = () => {
    onEnd();
  };

  try {
    recognizer.start();
  } catch (err: any) {
    onError(err.message || 'Could not start microphone');
  }

  return {
    stop: () => {
      try {
        recognizer.stop();
      } catch (e) {}
    }
  };
}
