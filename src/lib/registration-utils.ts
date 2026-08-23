import { randomInt } from 'crypto';

export function calculateAvailableSeats(carRows: number): number {
  if (carRows === 2) return 3;
  if (carRows === 3) return 5;
  throw new Error('Invalid car rows: only 2 or 3 rows are supported');
}

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRegistrationId(): string {
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = randomInt(0, ID_ALPHABET.length);
    suffix += ID_ALPHABET[randomIndex];
  }
  return `GATH-XXVI-${suffix}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeWhatsapp(whatsapp: string): string {
  let cleaned = whatsapp.replace(/\D/g, ''); // Remove non-digits
  
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  return cleaned;
}
