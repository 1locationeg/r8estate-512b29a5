const DEVICE_KEY = 'r8_device_token';
const LOGOUT_KEY = 'r8_logged_out';
const EXPIRY_DAYS = 90;

interface DeviceToken {
  token: string;
  email: string;
  userId: string;
  registeredAt: number;
  expiresAt: number;
  fingerprint: string;
}

function getFingerprint(): string {
  return btoa(`${navigator.userAgent}|${screen.width}|${screen.height}`).slice(0, 32);
}

export function registerDevice(userId: string, email: string): void {
  localStorage.removeItem(LOGOUT_KEY);

  const token: DeviceToken = {
    token: crypto.randomUUID(),
    email,
    userId,
    registeredAt: Date.now(),
    expiresAt: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    fingerprint: getFingerprint(),
  };
  localStorage.setItem(DEVICE_KEY, JSON.stringify(token));
}

export function checkDeviceRegistered(): {
  registered: boolean;
  email?: string;
  userId?: string;
  blockedByLogout?: boolean;
} {
  try {
    const intentionalLogout = localStorage.getItem(LOGOUT_KEY) === 'true';
    if (intentionalLogout) {
      return { registered: false, blockedByLogout: true };
    }

    const raw = localStorage.getItem(DEVICE_KEY);
    if (!raw) return { registered: false };

    const token: DeviceToken = JSON.parse(raw);
    const fingerprintMatch = token.fingerprint === getFingerprint();
    const notExpired = token.expiresAt > Date.now();

    if (fingerprintMatch && notExpired) {
      return { registered: true, email: token.email, userId: token.userId };
    }

    return { registered: false };
  } catch {
    return { registered: false };
  }
}

export function markIntentionalLogout(): void {
  localStorage.setItem(LOGOUT_KEY, 'true');
}

export function clearDeviceRegistration(): void {
  localStorage.removeItem(DEVICE_KEY);
  localStorage.removeItem(LOGOUT_KEY);
}

export function refreshDeviceExpiry(): void {
  try {
    const raw = localStorage.getItem(DEVICE_KEY);
    if (!raw) return;
    const token: DeviceToken = JSON.parse(raw);
    token.expiresAt = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DEVICE_KEY, JSON.stringify(token));
  } catch {
    // silently fail
  }
}
