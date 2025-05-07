
// Simple TOTP implementation for demonstration purposes
// In a real app, we would use a cryptographic library like 'otplib' or 'jsOTP'

export type TOTPOptions = {
  period?: number;
  digits?: number;
  algorithm?: "SHA1" | "SHA256" | "SHA512";
};

export function generateTOTP(secret: string, options: TOTPOptions = {}): string {
  const { 
    period = 30, 
    digits = 6,
    algorithm = "SHA1" 
  } = options;

  // In a real app, we'd use actual cryptographic functions
  // For this demo, we'll simulate TOTP with a simplified algorithm
  
  // Calculate time slice based on period
  const timeSlice = Math.floor(Date.now() / 1000 / period);
  
  // Combine secret and time for pseudo-random value
  const hash = simpleHash(secret + timeSlice.toString());
  
  // Generate appropriate number of digits
  return hash.toString().padStart(digits, '0').slice(-digits);
}

// Simple hash function for demonstration only
// In production, use actual HMAC-SHA1/SHA256/SHA512
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Make it positive and limit to 6 digits
  return Math.abs(hash) % 1000000;
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
