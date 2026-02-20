/**
 * Caesar Cipher Utility Functions
 * Provides encryption, decryption, and brute-force attack functionality
 */

/**
 * Normalizes the shift key to be within 0-25 range
 * @param shift - The shift value (can be negative or > 25)
 * @returns Normalized shift value between 0-25
 */
export function normalizeShift(shift: number): number {
  return ((shift % 26) + 26) % 26;
}

/**
 * Encrypts text using Caesar Cipher
 * @param text - The plaintext to encrypt
 * @param shift - The shift key (positive or negative)
 * @returns Encrypted text
 */
export function encrypt(text: string, shift: number): string {
  const normalizedShift = normalizeShift(shift);
  
  return text
    .split('')
    .map((char) => {
      // Handle uppercase letters
      if (char >= 'A' && char <= 'Z') {
        const charCode = char.charCodeAt(0) - 'A'.charCodeAt(0);
        const shiftedCode = (charCode + normalizedShift) % 26;
        return String.fromCharCode(shiftedCode + 'A'.charCodeAt(0));
      }
      // Handle lowercase letters
      else if (char >= 'a' && char <= 'z') {
        const charCode = char.charCodeAt(0) - 'a'.charCodeAt(0);
        const shiftedCode = (charCode + normalizedShift) % 26;
        return String.fromCharCode(shiftedCode + 'a'.charCodeAt(0));
      }
      // Keep numbers, spaces, and special characters unchanged
      else {
        return char;
      }
    })
    .join('');
}

/**
 * Decrypts text using Caesar Cipher
 * @param text - The ciphertext to decrypt
 * @param shift - The shift key used for encryption
 * @returns Decrypted text
 */
export function decrypt(text: string, shift: number): string {
  // Decryption is just encryption with negative shift
  return encrypt(text, -shift);
}

/**
 * Performs brute-force attack on Caesar Cipher
 * Tries all 25 possible shifts
 * @param text - The ciphertext to decrypt
 * @returns Array of all possible decryptions with their shift values
 */
export function bruteForce(text: string): Array<{ shift: number; text: string }> {
  const results = [];
  
  for (let shift = 0; shift < 26; shift++) {
    results.push({
      shift,
      text: encrypt(text, shift),
    });
  }
  
  return results;
}

/**
 * Simple English language score using common letter frequencies
 * Higher score = more likely to be English text
 * @param text - Text to analyze
 * @returns Score between 0 and 1
 */
export function getEnglishScore(text: string): number {
  // Common letter frequencies in English (simplified)
  const englishFreqs: Record<string, number> = {
    a: 0.082, b: 0.015, c: 0.028, d: 0.043, e: 0.127, f: 0.022, g: 0.020,
    h: 0.061, i: 0.070, j: 0.0015, k: 0.0077, l: 0.040, m: 0.024, n: 0.067,
    o: 0.075, p: 0.019, q: 0.0010, r: 0.060, s: 0.063, t: 0.091, u: 0.028,
    v: 0.0098, w: 0.024, x: 0.0015, y: 0.020, z: 0.0074,
  };

  const textLower = text.toLowerCase();
  const letters = textLower.match(/[a-z]/g) || [];
  
  if (letters.length === 0) return 0;

  let score = 0;
  const freqs: Record<string, number> = {};

  // Calculate frequency of each letter
  for (const letter of letters) {
    freqs[letter] = (freqs[letter] || 0) + 1;
  }

  // Score based on how close to English frequencies
  for (const [letter, freq] of Object.entries(freqs)) {
    const textFreq = freq / letters.length;
    const englishFreq = englishFreqs[letter] || 0;
    score += Math.abs(textFreq - englishFreq);
  }

  // Normalize to 0-1 range (lower difference = higher score)
  return Math.max(0, 1 - score);
}

/**
 * Finds the most likely English text from brute-force results
 * @param results - Results from bruteForce function
 * @returns Best match with its shift value
 */
export function findBestMatch(results: Array<{ shift: number; text: string }>): { shift: number; text: string; score: number } {
  let bestMatch = results[0];
  let bestScore = getEnglishScore(results[0].text);

  for (const result of results.slice(1)) {
    const score = getEnglishScore(result.text);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = result;
    }
  }

  return { ...bestMatch, score: bestScore };
}
