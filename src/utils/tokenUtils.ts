
// Implementation of RFC 6238 TOTP (Time-based One-Time Password) algorithm
// Based on the HMAC-based One-Time Password algorithm (HOTP) from RFC 4226

import * as base32 from 'hi-base32';

export type TOTPOptions = {
  period?: number;
  digits?: number;
  algorithm?: "SHA1" | "SHA256" | "SHA512";
};

// Convert a hex string to a byte array
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Convert an integer to a byte array
const intToBytes = (num: number): Uint8Array => {
  const bytes = new Uint8Array(8);
  let temp = num;
  // Convert to big-endian byte array
  for (let i = 7; i >= 0; i--) {
    bytes[i] = temp & 0xff;
    temp = temp >> 8;
  }
  return bytes;
};

// Generate HMAC using Web Crypto API
const generateHMAC = async (
  algorithm: string,
  key: Uint8Array,
  message: Uint8Array
): Promise<Uint8Array> => {
  // Map algorithm names to their Web Crypto API counterparts
  const algorithmMap: Record<string, string> = {
    "SHA1": "SHA-1",
    "SHA256": "SHA-256", 
    "SHA512": "SHA-512"
  };
  
  // Use the mapped algorithm name for Web Crypto API
  const cryptoAlgorithm = {
    name: 'HMAC',
    hash: { name: algorithmMap[algorithm] || "SHA-1" }
  };
  
  // Create clean ArrayBuffer-backed Uint8Arrays for Web Crypto API
  const keyBuffer = Uint8Array.from(key);
  const messageBuffer = Uint8Array.from(message);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    cryptoAlgorithm,
    false,
    ['sign']
  );
  
  const signature = await window.crypto.subtle.sign(
    cryptoAlgorithm,
    cryptoKey,
    messageBuffer
  );
  
  return new Uint8Array(signature);
};

// Generate a TOTP code based on the secret and options
export async function generateTOTP(secret: string, options: TOTPOptions = {}): Promise<string> {
  try {
    const { 
      period = 30, 
      digits = 6,
      algorithm = "SHA1" 
    } = options;

    // Normalize and decode the base32 secret
    const normalizedSecret = secret.toUpperCase().replace(/\s/g, '');
    let key: Uint8Array;
    
    try {
      // Decode the base32 secret
      const decoded = base32.decode.asBytes(normalizedSecret);
      // Create a new Uint8Array with proper ArrayBuffer to satisfy Web Crypto API types
      key = new Uint8Array(new ArrayBuffer(decoded.length));
      key.set(decoded);
    } catch (e) {
      console.error('Error decoding base32 secret:', e);
      // If base32 decoding fails, try using the raw secret
      key = new TextEncoder().encode(secret);
    }

    // Calculate time counter (number of time steps since Unix epoch)
    const counter = Math.floor(Date.now() / 1000 / period);
    const counterBytes = intToBytes(counter);
    
    // Create HMAC using Web Crypto API
    const hmacBytes = await generateHMAC(
      algorithm,
      key,
      counterBytes
    );
    
    // Dynamic truncation
    const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
    
    // Take 4 bytes starting at the offset
    const binCode = 
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);
    
    // Generate the specified number of digits
    const otp = binCode % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return '000000'; // Return fallback code on error
  }
}

export function getTimeRemaining(period: number = 30): number {
  const seconds = Math.floor(Date.now() / 1000);
  return period - (seconds % period);
}

export function formatTOTPDisplay(code: string): string {
  // Format code with a space in the middle for readability
  // e.g. "123456" -> "123 456"
  const half = Math.floor(code.length / 2);
  return `${code.slice(0, half)} ${code.slice(half)}`;
}

// Function to calculate SVG circle dash offset for countdown visualization
export function calculateCircleDashOffset(period: number = 30): number {
  const timeRemaining = getTimeRemaining(period);
  const percentage = timeRemaining / period;
  const circumference = 2 * Math.PI * 45; // Circle radius is 45
  
  return circumference * (1 - percentage);
}
