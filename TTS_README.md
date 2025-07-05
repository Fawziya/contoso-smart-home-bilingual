# ElevenLabs TTS Audio Feature

This document explains the ElevenLabs TTS (Text-to-Speech) audio feature implemented for the Meowtica Smart Hub product page.

## Overview

The TTS audio feature allows users to listen to the product description of the Meowtica Smart Hub (Product ID: 1) in both English and Chinese languages. The audio button is positioned at the beginning of the first paragraph of the product description.

## Features

- **Bilingual Support**: Supports both English and Chinese text-to-speech
- **ElevenLabs Integration**: Uses ElevenLabs MCP server for high-quality voice synthesis
- **Visual Feedback**: Provides clear visual indicators for different audio states (idle, loading, playing, paused, error)
- **Audio Caching**: Caches generated audio to avoid repeated API calls
- **Responsive Design**: Works on both mobile and desktop devices
- **Accessibility**: Includes ARIA labels and keyboard navigation support

## Components

### TTSAudio Component (`src/components/tts-audio.tsx`)
A reusable React component that handles text-to-speech functionality:
- Manages audio state (idle, loading, playing, paused, error)
- Integrates with ElevenLabs API
- Provides visual feedback with icons and status text
- Handles audio cleanup and memory management

### TTS API Route (`src/app/api/tts/route.ts`)
A Next.js API route that interfaces with ElevenLabs:
- Validates input parameters
- Calls ElevenLabs TTS API
- Handles error scenarios and rate limiting
- Returns audio data with appropriate caching headers

## Setup

### Prerequisites
1. ElevenLabs API key
2. Environment variable configuration

### Environment Variables
Create a `.env.local` file in your project root:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Get your API key from: https://elevenlabs.io/docs/api-reference/authentication

### Voice Configuration
The current implementation uses:
- **English**: Default multilingual voice (Adam)
- **Chinese**: Same multilingual voice with Chinese language support
- **Model**: `eleven_multilingual_v2`

## Usage

The TTS audio feature is automatically available on the Meowtica Smart Hub product page:
- English: `/en/products/meowtica-smart-hub`
- Chinese: `/zh/products/meowtica-smart-hub`

### Audio Controls
- **Click to play audio** / **点击播放音频**: Start audio generation and playback
- **Playing...** / **正在播放...**: Audio is currently playing
- **Paused** / **已暂停**: Audio is paused (click to resume)
- **Loading...** / **正在生成音频...**: Audio is being generated
- **Playback error** / **播放出错**: Error occurred during generation or playback

## Error Handling

The system handles various error scenarios:
- **Network failures**: Graceful fallback with user-friendly messages
- **API rate limits**: Appropriate error messages and retry suggestions
- **Invalid audio**: Audio generation and playback error handling
- **Missing API key**: Configuration error messages

## Performance Optimizations

- **Audio Caching**: Generated audio is cached to avoid repeated API calls
- **Lazy Loading**: Audio is only generated when user clicks the play button
- **Memory Management**: Proper cleanup of audio resources
- **Optimized Bundle**: Minimal impact on page load times

## Browser Compatibility

The TTS feature is compatible with modern browsers that support:
- HTML5 Audio API
- Fetch API
- ES6+ JavaScript features

## Technical Details

### Audio States
```typescript
type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
```

### TTS Request Interface
```typescript
interface TTSRequest {
  text: string;
  language: 'en' | 'zh';
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}
```

### Voice Settings
- **Stability**: 0.5 (balanced voice consistency)
- **Similarity Boost**: 0.8 (high voice similarity)
- **Style**: 0.3 (natural speaking style)

## Troubleshooting

### Common Issues

1. **Audio not playing**
   - Check if ElevenLabs API key is configured
   - Verify network connectivity
   - Check browser audio permissions

2. **API rate limits**
   - Wait for the rate limit to reset
   - Consider upgrading ElevenLabs plan for higher limits

3. **Poor audio quality**
   - Adjust voice settings in the API route
   - Try different voice models

### Development

To test the TTS feature locally:
1. Set up ElevenLabs API key in `.env.local`
2. Run `npm run dev`
3. Navigate to the Meowtica Smart Hub product page
4. Click the audio button to test

## Future Enhancements

Potential improvements for the TTS feature:
- Support for more languages
- Custom voice selection
- Audio speed controls
- Audio progress indicators
- Download audio capability
- Voice preference settings