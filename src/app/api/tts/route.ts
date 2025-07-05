import { NextRequest, NextResponse } from 'next/server';
import { TTSRequest } from '@/lib/types';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Voice IDs for different languages
const VOICE_CONFIG = {
  en: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Default English voice (Adam)
    model: 'eleven_multilingual_v2'
  },
  zh: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Same voice with multilingual support
    model: 'eleven_multilingual_v2'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, language, stability = 0.5, similarityBoost = 0.8, style = 0.3 } = body;

    // Validate input
    if (!text || !language) {
      return NextResponse.json(
        { error: 'Text and language are required' },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'TTS service not configured' },
        { status: 500 }
      );
    }

    // Get voice configuration for the language
    const voiceConfig = VOICE_CONFIG[language];
    if (!voiceConfig) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }

    // Prepare ElevenLabs API request
    const elevenlabsRequest = {
      text: text,
      model_id: voiceConfig.model,
      voice_settings: {
        stability: stability,
        similarity_boost: similarityBoost,
        style: style,
        use_speaker_boost: true
      }
    };

    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceConfig.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify(elevenlabsRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'TTS service authentication failed' },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'TTS service rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: 'TTS service temporarily unavailable' },
          { status: 503 }
        );
      }
    }

    // Get audio data
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Return audio data with appropriate headers
    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': audioArrayBuffer.byteLength.toString()
      }
    });

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