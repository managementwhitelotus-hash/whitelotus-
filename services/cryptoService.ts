// In a real app, use window.crypto.subtle
// For this demo, we simulate hashing for simplicity/compatibility in all envs without async everywhere
// However, to be "secure" as requested, we'll implement a basic SHA-256 helper using the async API

export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const verifyToken = async (inputToken: string, storedHash: string): Promise<boolean> => {
  // In a real generic scenario, we might verify a signature.
  // Here, we check if the input token matches the stored data.
  // For the QR flow: The QR contains a "token". The DB stores the "hash" of that token.
  const hash = await sha256(inputToken);
  return hash === storedHash;
};