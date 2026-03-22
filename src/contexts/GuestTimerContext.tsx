import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkDeviceRegistered } from '@/utils/deviceAuth';

const GUEST_DURATION_SECONDS = 3 * 60; // 3 minutes
const BONUS_SECONDS = 2 * 60; // 2 minutes
const STORAGE_KEY = 'r8estate_guest_start';
const BONUS_USED_KEY = 'r8estate_guest_bonus_used';
export const DEVICE_REGISTERED_KEY = 'r8estate_device_registered';

interface GuestTimerContextType {
  secondsLeft: number;
  isExpired: boolean;
  isGuest: boolean;
  dismissExpiredModal: () => void;
  expiredModalOpen: boolean;
  grantBonusTime: () => void;
  hasBonusBeenUsed: boolean;
}

const GuestTimerContext = createContext<GuestTimerContextType | undefined>(undefined);

export function GuestTimerProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(GUEST_DURATION_SECONDS);
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const [hasBonusBeenUsed, setHasBonusBeenUsed] = useState(() => localStorage.getItem(BONUS_USED_KEY) === '1');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  // Use shared device-auth helper instead of duplicating fingerprint logic
  const device = checkDeviceRegistered();
  // Only suppress guest timer for actively registered devices, NOT for logged-out devices
  const isGuest = !isLoading && !user && !device.registered;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((startTime: number, totalDuration: number) => {
    clearTimer();
    hasExpiredRef.current = false;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, totalDuration - elapsed);
      setSecondsLeft(remaining);

      if (remaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        setExpiredModalOpen(true);
        clearTimer();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer]);

  useEffect(() => {
    if (!isGuest || isLoading) {
      clearTimer();
      hasExpiredRef.current = false;
      setExpiredModalOpen(false);
      setSecondsLeft(GUEST_DURATION_SECONDS);
      return;
    }

    let startTime = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const now = Date.now();
    const bonusUsed = localStorage.getItem(BONUS_USED_KEY) === '1';
    const totalDuration = bonusUsed ? GUEST_DURATION_SECONDS + BONUS_SECONDS : GUEST_DURATION_SECONDS;

    if (!startTime || now - startTime > totalDuration * 1000) {
      startTime = now;
      localStorage.setItem(STORAGE_KEY, String(startTime));
      localStorage.removeItem(BONUS_USED_KEY);
      setHasBonusBeenUsed(false);
    }

    startCountdown(startTime, totalDuration);
    return clearTimer;
  }, [isGuest, isLoading, clearTimer, startCountdown]);

  useEffect(() => {
    if (user) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BONUS_USED_KEY);
      hasExpiredRef.current = false;
      setHasBonusBeenUsed(false);
    }
  }, [user]);

  const dismissExpiredModal = useCallback(() => {
    setExpiredModalOpen(false);
  }, []);

  const grantBonusTime = useCallback(() => {
    if (hasBonusBeenUsed) return;

    localStorage.setItem(BONUS_USED_KEY, '1');
    setHasBonusBeenUsed(true);

    const startTime = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const newTotalDuration = elapsed + BONUS_SECONDS;

    const newStartTime = Date.now() - elapsed * 1000;
    localStorage.setItem(STORAGE_KEY, String(newStartTime));

    setExpiredModalOpen(false);
    hasExpiredRef.current = false;
    startCountdown(newStartTime, newTotalDuration);
  }, [hasBonusBeenUsed, startCountdown]);

  return (
    <GuestTimerContext.Provider
      value={{
        secondsLeft,
        isExpired: hasExpiredRef.current,
        isGuest,
        dismissExpiredModal,
        expiredModalOpen,
        grantBonusTime,
        hasBonusBeenUsed,
      }}
    >
      {children}
    </GuestTimerContext.Provider>
  );
}

export function useGuestTimer() {
  const ctx = useContext(GuestTimerContext);
  if (!ctx) {
    return {
      secondsLeft: 0,
      isExpired: false,
      isGuest: false,
      dismissExpiredModal: () => {},
      expiredModalOpen: false,
      grantBonusTime: () => {},
      hasBonusBeenUsed: false,
    } as GuestTimerContextType;
  }
  return ctx;
}
