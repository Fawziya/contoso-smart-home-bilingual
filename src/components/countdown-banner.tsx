'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/language-context';

interface CountdownBannerProps {
  productSlug: string;
}

export default function CountdownBanner({ productSlug }: CountdownBannerProps) {
  const { t, locale } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const [isVisible, setIsVisible] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Only show countdown banner for the Meowtica Smart Hub product
  const shouldShowBanner = productSlug === 'meowtica-smart-hub';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!shouldShowBanner || !isClient) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsVisible(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldShowBanner, isClient]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't render if not visible, not client-side, or wrong product
  if (!isVisible || !isClient || !shouldShowBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-gradient-x bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Left side - Flash sale text and promotion */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-2xl">🔥</span>
              <span className="text-sm sm:text-lg font-bold animate-pulse">{t('countdown.flashSale')}</span>
            </div>
            <div className="bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs sm:text-sm font-bold animate-bounce">
              50% OFF
            </div>
          </div>

          {/* Center - Promotion text */}
          <div className="text-center order-last sm:order-none">
            <div className="text-xs sm:text-sm md:text-base font-medium">
              {t('countdown.promotion')}
            </div>
          </div>

          {/* Right side - Timer and close button */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex flex-col items-center">
              <div className="text-xs text-yellow-100">{t('countdown.timeLeft')}</div>
              <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold bg-black bg-opacity-20 px-2 sm:px-3 py-1 rounded">
                {formatTime(timeLeft)}
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-yellow-200 text-lg sm:text-xl font-bold p-1 flex-shrink-0"
              aria-label="Close banner"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}