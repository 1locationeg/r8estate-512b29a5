/**
 * Generates deterministic SVG-based avatar data URLs.
 * No external network requests — renders instantly.
 */

const DEVELOPER_COLORS = [
  ['#1a365d', '#2b6cb0'], // Navy → Blue
  ['#1e3a5f', '#4299e1'], // Dark Blue → Light Blue
  ['#2d3748', '#4a5568'], // Dark Gray → Gray
  ['#1a202c', '#2d3748'], // Near Black → Dark Gray
  ['#2c5282', '#3182ce'], // Medium Blue → Bright Blue
  ['#1c4532', '#276749'], // Dark Green → Green
  ['#553c9a', '#6b46c1'], // Purple → Light Purple
  ['#744210', '#975a16'], // Brown → Gold
];

const REVIEWER_COLORS = [
  ['#9b2c2c', '#c53030'], // Dark Red
  ['#2c7a7b', '#319795'], // Teal
  ['#6b46c1', '#805ad5'], // Purple
  ['#2b6cb0', '#3182ce'], // Blue
  ['#c05621', '#dd6b20'], // Orange
  ['#276749', '#38a169'], // Green
  ['#b7791f', '#d69e2e'], // Gold
  ['#702459', '#97266d'], // Pink
];

const PROJECT_COLORS = [
  ['#2b6cb0', '#4299e1'], // Blue
  ['#2f855a', '#48bb78'], // Green
  ['#b7791f', '#ecc94b'], // Gold
  ['#9b2c2c', '#e53e3e'], // Red
  ['#6b46c1', '#9f7aea'], // Purple
  ['#2c7a7b', '#4fd1c5'], // Teal
  ['#c05621', '#ed8936'], // Orange
  ['#1a365d', '#63b3ed'], // Navy → Sky
];

const CATEGORY_COLORS = [
  ['#2b6cb0', '#63b3ed'],
  ['#2f855a', '#68d391'],
  ['#9b2c2c', '#fc8181'],
  ['#6b46c1', '#b794f4'],
  ['#c05621', '#fbd38d'],
  ['#2c7a7b', '#81e6d9'],
  ['#b7791f', '#f6e05e'],
  ['#702459', '#f687b3'],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type AvatarType = 'developer' | 'project' | 'reviewer' | 'category';

export function generateAvatar(name: string, type: AvatarType = 'developer'): string {
  const hash = hashString(name);
  const initials = getInitials(name);
  
  const palettes = {
    developer: DEVELOPER_COLORS,
    project: PROJECT_COLORS,
    reviewer: REVIEWER_COLORS,
    category: CATEGORY_COLORS,
  };
  
  const colors = palettes[type];
  const [c1, c2] = colors[hash % colors.length];
  
  const gradientId = `g${hash}`;
  const fontSize = initials.length === 1 ? 44 : 36;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="${type === 'reviewer' ? '50' : '12'}" fill="url(#${gradientId})"/>
    <text x="50" y="50" dy=".35em" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="white" opacity="0.95">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
