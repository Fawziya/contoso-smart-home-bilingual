import { NextRequest, NextResponse } from 'next/server';
import { TTSRequest } from '@/lib/types';

// Voice IDs for different languages
const VOICE_CONFIG = {
  en: 'pNInz6obpgDQGcFmaJgB', // Default English voice (Adam)  
  zh: 'pNInz6obpgDQGcFmaJgB'  // Same voice with multilingual support
};

// Function to generate demo TTS audio
async function generateDemoTTSAudio(text: string, language: string): Promise<ArrayBuffer> {
  // Create a pleasant demo audio that simulates TTS
  // This will be a sequence of tones that represent the text being "spoken"
  
  const sampleRate = 22050;
  const noteDuration = 0.15; // seconds per character group
  const totalDuration = Math.min(text.length * 0.02 + 1, 5); // max 5 seconds
  const samples = Math.floor(sampleRate * totalDuration);
  
  // Create WAV file format
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  
  // Write WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true); // file size
  writeString(8, 'WAVE');
  
  // Format chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // format chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  
  // Data chunk
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true); // data size
  
  // Generate audio data that simulates speech patterns
  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    let sample = 0;
    
    // Create speech-like patterns with varying frequencies and pauses
    const wordProgress = (time / totalDuration) * text.length;
    const charIndex = Math.floor(wordProgress);
    
    if (charIndex < text.length) {
      const char = text[charIndex];
      
      // Different frequencies for different character types
      let baseFreq = 200;
      if (char === ' ') {
        // Pause for spaces
        sample = 0;
      } else if (char.match(/[aeiouAEIOU]/)) {
        // Vowels - lower frequency
        baseFreq = 180 + Math.sin(time * 8) * 20;
        sample = Math.sin(2 * Math.PI * baseFreq * time) * 0.3;
      } else if (char.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/)) {
        // Consonants - higher frequency
        baseFreq = 250 + Math.sin(time * 12) * 30;
        sample = Math.sin(2 * Math.PI * baseFreq * time) * 0.25;
      } else {
        // Punctuation - brief pause or soft tone
        baseFreq = 150;
        sample = Math.sin(2 * Math.PI * baseFreq * time) * 0.1;
      }
      
      // Add natural speech rhythm
      const envelope = Math.sin(time * Math.PI / totalDuration); // fade in/out
      const rhythm = Math.sin(time * 3) * 0.1 + 0.9; // slight rhythm variation
      sample *= envelope * rhythm;
      
      // Add slight reverb effect
      if (i > sampleRate * 0.1) {
        const delayIndex = i - Math.floor(sampleRate * 0.05);
        if (delayIndex >= 0 && delayIndex < samples) {
          sample += view.getInt16(44 + delayIndex * 2, true) / 32767 * 0.1;
        }
      }
    }
    
    // Convert to 16-bit PCM with soft limiting
    const pcmSample = Math.max(-1, Math.min(1, sample)) * 32767;
    view.setInt16(44 + i * 2, pcmSample, true);
  }
  
  return buffer;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, language } = body;

    // Validate input
    if (!text || !language) {
      return NextResponse.json(
        { error: 'Text and language are required' },
        { status: 400 }
      );
    }

    // Get voice configuration for the language
    const voiceId = VOICE_CONFIG[language];
    if (!voiceId) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }

    try {
      console.log(`Generating demo TTS audio for: "${text.substring(0, 50)}..." in language: ${language}`);
      
      // Generate demo audio
      const audioBuffer = await generateDemoTTSAudio(text, language);
      
      // Return audio data with appropriate headers
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Content-Length': audioBuffer.byteLength.toString(),
          'Accept-Ranges': 'bytes'
        }
      });

    } catch (ttsError) {
      console.error('TTS generation error:', ttsError);
      return NextResponse.json(
        { error: 'Failed to generate audio. Please try again.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}