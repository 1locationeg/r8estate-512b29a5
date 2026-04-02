import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkDeviceRegistered } from '@/utils/deviceAuth';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_GUEST_DURATION = 3 * 60;
const DEFAULT_BONUS = 2 * 60;
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
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_GUEST_DURATION);
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const [hasBonusBeenUsed, setHasBonusBeenUsed] = useState(() => localStorage.getItem(BONUS_USED_KEY) === '1');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasExpiredRef = useRef(false);

  // Remote settings
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [guestDuration, setGuestDuration] = useState(DEFAULT_GUEST_DURATION);
  const [bonusDuration, setBonusDuration] = useState(DEFAULT_BONUS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Fetch timer settings from platform_settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['guest_timer_enabled', 'guest_timer_duration_seconds', 'guest_timer_bonus_seconds']);

      if (data) {
        data.forEach((row) => {
          if (row.key === 'guest_timer_enabled') setTimerEnabled(row.value === 'true');
          if (row.key === 'guest_timer_duration_seconds') setGuestDuration(parseInt(row.value) || DEFAULT_GUEST_DURATION);
          if (row.key === 'guest_timer_bonus_seconds') setBonusDuration(parseInt(row.value) || DEFAULT_BONUS);
        });
      }
      setSettingsLoaded(true);
    };
    fetchSettings();
  }, []);

  const device = checkDeviceRegistered();
  const isGuest = !isLoading && !user && !device.registered && timerEnabled && settingsLoaded;

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
    if (!isGuest || isLoading || !settingsLoaded) {
      clearTimer();
      hasExpiredRef.current = false;
      setExpiredModalOpen(false);
      setSecondsLeft(guestDuration);
      return;
    }

    let startTime = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    const now = Date.now();
    const bonusUsed = localStorage.getItem(BONUS_USED_KEY) === '1';
    const totalDuration = bonusUsed ? guestDuration + bonusDuration : guestDuration;

    if (!startTime || now - startTime > totalDuration * 1000) {
      startTime = now;
      localStorage.setItem(STORAGE_KEY, String(startTime));
      localStorage.removeItem(BONUS_USED_KEY);
      setHasBonusBeenUsed(false);
    }

    startCountdown(startTime, totalDuration);
    return clearTimer;
  }, [isGuest, isLoading, clearTimer, startCountdown, settingsLoaded, guestDuration, bonusDuration]);

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
    const newTotalDuration = elapsed + bonusDuration;

    const newStartTime = Date.now() - elapsed * 1000;
    localStorage.setItem(STORAGE_KEY, String(newStartTime));

    setExpiredModalOpen(false);
    hasExpiredRef.current = false;
    startCountdown(newStartTime, newTotalDuration);
  }, [hasBonusBeenUsed, startCountdown, bonusDuration]);

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
