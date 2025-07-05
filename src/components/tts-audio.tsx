'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { TTSRequest, TTSResponse, AudioState } from '@/lib/types';
import { useTranslation } from '@/lib/language-context';

interface TTSAudioProps {
  text: string;
  productId?: number;
  className?: string;
}

// Cache for audio URLs to avoid repeated API calls
const audioCache = new Map<string, string>();

export default function TTSAudio({ text, productId, className = '' }: TTSAudioProps) {
  const { locale } = useTranslation();
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string>('');

  // Generate cache key
  const getCacheKey = (text: string, language: string) => `${language}-${text}`;

  // Clean up audio resources
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (currentAudioUrl.current) {
      URL.revokeObjectURL(currentAudioUrl.current);
      currentAudioUrl.current = '';
    }
  };

  // Generate TTS audio using ElevenLabs MCP server
  const generateTTS = async (text: string, language: 'en' | 'zh'): Promise<string> => {
    const cacheKey = getCacheKey(text, language);
    
    // Check cache first
    if (audioCache.has(cacheKey)) {
      return audioCache.get(cacheKey)!;
    }

    try {
      const ttsRequest: TTSRequest = {
        text,
        language,
        // Configure voice settings for optimal quality
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.3
      };

      // Call ElevenLabs MCP server API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ttsRequest),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      audioCache.set(cacheKey, audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw new Error('Failed to generate audio. Please try again.');
    }
  };

  // Handle play/pause toggle
  const handlePlayPause = async () => {
    if (audioState === 'playing') {
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
        setAudioState('paused');
      }
      return;
    }

    if (audioState === 'paused') {
      // Resume audio
      if (audioRef.current) {
        audioRef.current.play();
        setAudioState('playing');
      }
      return;
    }

    // Generate and play new audio
    setAudioState('loading');
    setErrorMessage('');

    try {
      const audioUrl = await generateTTS(text, locale as 'en' | 'zh');
      
      // Create new audio element
      cleanupAudio();
      audioRef.current = new Audio(audioUrl);
      currentAudioUrl.current = audioUrl;

      // Set up audio event listeners
      audioRef.current.addEventListener('ended', () => {
        setAudioState('idle');
      });

      audioRef.current.addEventListener('error', () => {
        setAudioState('error');
        setErrorMessage('Audio playback failed');
      });

      audioRef.current.addEventListener('loadstart', () => {
        setAudioState('loading');
      });

      audioRef.current.addEventListener('canplay', () => {
        setAudioState('playing');
      });

      // Start playback
      await audioRef.current.play();
      setAudioState('playing');
    } catch (error) {
      setAudioState('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Get status text based on current state
  const getStatusText = (): string => {
    switch (audioState) {
      case 'idle':
        return locale === 'zh' ? '点击播放音频' : 'Click to play audio';
      case 'loading':
        return locale === 'zh' ? '正在生成音频...' : 'Generating audio...';
      case 'playing':
        return locale === 'zh' ? '正在播放...' : 'Playing...';
      case 'paused':
        return locale === 'zh' ? '已暂停' : 'Paused';
      case 'error':
        return locale === 'zh' ? '播放出错' : 'Playback error';
      default:
        return '';
    }
  };

  // Get icon based on current state
  const getIcon = () => {
    switch (audioState) {
      case 'loading':
        return <ArrowPathIcon className="h-5 w-5 animate-spin" />;
      case 'playing':
        return <PauseIcon className="h-5 w-5" />;
      case 'error':
        return <SpeakerWaveIcon className="h-5 w-5 text-red-500" />;
      default:
        return <PlayIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePlayPause}
        disabled={audioState === 'loading'}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg border
          transition-all duration-200 ease-in-out
          ${audioState === 'error' 
            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
          ${audioState === 'loading' 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer hover:shadow-sm'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        aria-label={getStatusText()}
        title={getStatusText()}
      >
        {getIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
      </button>
      
      {errorMessage && (
        <div className="text-sm text-red-600 mt-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
}