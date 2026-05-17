import {
  DEFAULT_PIN_LENGTH,
  isPinLength,
  isValidPinForLength,
  parseStoredPinLength,
  pinLengthLabel,
} from '@/lib/pin-length';

describe('pin-length', () => {
  it('accepts 4–6 only', () => {
    expect(isPinLength(3)).toBe(false);
    expect(isPinLength(4)).toBe(true);
    expect(isPinLength(6)).toBe(true);
    expect(isPinLength(7)).toBe(false);
  });

  it('falls back to default when storage is missing or invalid', () => {
    expect(parseStoredPinLength(null)).toBe(DEFAULT_PIN_LENGTH);
    expect(parseStoredPinLength('')).toBe(DEFAULT_PIN_LENGTH);
    expect(parseStoredPinLength('9')).toBe(DEFAULT_PIN_LENGTH);
  });

  it('parses valid stored lengths', () => {
    expect(parseStoredPinLength('4')).toBe(4);
    expect(parseStoredPinLength('5')).toBe(5);
  });

  it('validates digit strings for a length', () => {
    expect(isValidPinForLength('1234', 4)).toBe(true);
    expect(isValidPinForLength('12345', 4)).toBe(false);
    expect(isValidPinForLength('12a4', 4)).toBe(false);
  });

  it('formats unlock hint copy', () => {
    expect(pinLengthLabel(4)).toBe('four digit pin');
    expect(pinLengthLabel(6)).toBe('six digit pin');
  });
});
