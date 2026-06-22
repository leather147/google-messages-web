/**
 * Tiny nanoid-like ID generator (no external dep).
 */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nanoid(size = 12): string {
  let id = "";
  for (let i = 0; i < size; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}
