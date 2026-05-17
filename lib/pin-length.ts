export const MIN_PIN_LENGTH = 4;
export const MAX_PIN_LENGTH = 6;
export const DEFAULT_PIN_LENGTH = 6;

export type PinLength = 4 | 5 | 6;

export const PIN_LENGTH_OPTIONS: readonly PinLength[] = [4, 5, 6];

export function isPinLength(value: number): value is PinLength {
  return Number.isInteger(value) && value >= MIN_PIN_LENGTH && value <= MAX_PIN_LENGTH;
}

export function parseStoredPinLength(raw: string | null): PinLength {
  const n = Number(raw);
  return isPinLength(n) ? n : DEFAULT_PIN_LENGTH;
}

export function pinLengthLabel(length: PinLength): string {
  const words: Record<PinLength, string> = { 4: 'four', 5: 'five', 6: 'six' };
  return `${words[length]} digit pin`;
}

export function isValidPinForLength(pin: string, length: PinLength): boolean {
  return /^\d+$/.test(pin) && pin.length === length;
}
