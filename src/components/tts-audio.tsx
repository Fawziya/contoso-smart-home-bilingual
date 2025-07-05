'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { AudioState } from '@/lib/types';
import { useTranslation } from '@/lib/language-context';

interface TTSAudioProps {
  productSlug: string;
  className?: string;
}

export default function TTSAudio({ productSlug, className = '' }: TTSAudioProps) {
  const { locale } = useTranslation();
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get audio file path based on product slug and language
  const getAudioPath = (productSlug: string, language: string) => 
    `/audio/${productSlug}-${language}.mp3`;

  // Clean up audio resources
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  // Load audio from audio directory
  const loadAudio = (productSlug: string, language: 'en' | 'zh'): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audioPath = getAudioPath(productSlug, language);
        
        // Create new audio element
        cleanupAudio();
        audioRef.current = new Audio(audioPath);

        // Set up audio event listeners
        audioRef.current.addEventListener('ended', () => {
          setAudioState('idle');
        });

        audioRef.current.addEventListener('error', () => {
          setAudioState('error');
          setErrorMessage('Audio file not found or failed to load');
          reject(new Error('Audio failed to load'));
        });

        audioRef.current.addEventListener('loadstart', () => {
          setAudioState('loading');
        });

        audioRef.current.addEventListener('canplay', () => {
          setAudioState('playing');
          resolve();
        });

        // Start loading
        audioRef.current.load();
      } catch (error) {
        reject(error);
      }
    });
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

    // Load and play audio from audio directory
    setAudioState('loading');
    setErrorMessage('');

    try {
      await loadAudio(productSlug, locale as 'en' | 'zh');
      
      // Start playback
      if (audioRef.current) {
        await audioRef.current.play();
        setAudioState('playing');
      }
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
        return locale === 'zh' ? '正在加载音频...' : 'Loading audio...';
      case 'playing':
        return locale === 'zh' ? '正在播放...' : 'Playing...';
      case 'paused':
        return locale === 'zh' ? '已暂停' : 'Paused';
      case 'error':
        return locale === 'zh' ? '播放出错' : 'Audio error';
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