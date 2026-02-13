
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const encodeBase62 = (num: number): string => {
  if (num === 0) return CHARS[0];
  let encoded = '';
  while (num > 0) {
    encoded = CHARS[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded;
};

export const generateShortCode = (): string => {
  // Use timestamp + random for high collision resistance in this demo
  const id = Date.now() + Math.floor(Math.random() * 1000000);
  return encodeBase62(id).slice(-7);
};
