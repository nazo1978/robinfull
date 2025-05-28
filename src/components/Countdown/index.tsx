'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  compact?: boolean;
}

export default function Countdown({ targetDate, compact = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return <span>{compact ? "Bitti" : "Açık artırma sona erdi"}</span>;
  }

  if (compact) {
    if (timeLeft.days > 0) {
      return <span>{timeLeft.days}g {timeLeft.hours}s</span>;
    }
    if (timeLeft.hours > 0) {
      return <span>{timeLeft.hours}s {timeLeft.minutes}d</span>;
    }
    return <span>{timeLeft.minutes}d {timeLeft.seconds}s</span>;
  }

  return (
    <div className="flex items-center">
      {timeLeft.days > 0 && (
        <>
          <div className="text-center">
            <span className="font-semibold">{timeLeft.days}</span>
            <span className="text-xs block">gün</span>
          </div>
          <span className="mx-1">:</span>
        </>
      )}
      <div className="text-center">
        <span className="font-semibold">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-xs block">saat</span>
      </div>
      <span className="mx-1">:</span>
      <div className="text-center">
        <span className="font-semibold">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-xs block">dakika</span>
      </div>
      <span className="mx-1">:</span>
      <div className="text-center">
        <span className="font-semibold">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-xs block">saniye</span>
      </div>
    </div>
  );
} 