import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const GUEST_DURATION_SECONDS = 3 * 60; // 3 minutes
const STORAGE_KEY = 'r8estate_guest_start';

interface GuestTimerContextType {
  secondsLeft: number;
  isExpired: boolean;
  isGuest: boolean;
  dismissExpiredModal: () => void;
  expiredModalOpen: boolean;
}

const GuestTimerContext = createContext<GuestTimerContextType | undefined>(undefined);

export function GuestTimerProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(GUEST_DURATION_SECONDS);
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  const isGuest = !isLoading && !user;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // If user is logged in, clear everything
    if (!isGuest || isLoading) {
      clearTimer();
      hasExpiredRef.current = false;
      setExpiredModalOpen(false);
      setSecondsLeft(GUEST_DURATION_SECONDS);
      return;
    }

    // Get or set the start time in localStorage for persistence
    let startTime = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const now = Date.now();

    // If no start time or it was longer ago than our duration, reset
    if (!startTime || now - startTime > GUEST_DURATION_SECONDS * 1000) {
      startTime = now;
      localStorage.setItem(STORAGE_KEY, String(startTime));
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, GUEST_DURATION_SECONDS - elapsed);
      setSecondsLeft(remaining);

      if (remaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        setExpiredModalOpen(true);
        clearTimer();
      }
    };

    tick(); // Run immediately
    intervalRef.current = setInterval(tick, 1000);

    return clearTimer;
  }, [isGuest, isLoading, clearTimer]);

  // When user signs in, clear the stored start time
  useEffect(() => {
    if (user) {
      localStorage.removeItem(STORAGE_KEY);
      hasExpiredRef.current = false;
    }
  }, [user]);

  const dismissExpiredModal = useCallback(() => {
    setExpiredModalOpen(false);
  }, []);

  return (
    <GuestTimerContext.Provider
      value={{
        secondsLeft,
        isExpired: hasExpiredRef.current,
        isGuest,
        dismissExpiredModal,
        expiredModalOpen,
      }}
    >
      {children}
    </GuestTimerContext.Provider>
  );
}

export function useGuestTimer() {
  const ctx = useContext(GuestTimerContext);
  if (!ctx) throw new Error('useGuestTimer must be used within GuestTimerProvider');
  return ctx;
}
