import crypto from 'crypto';

// Use environment variable for encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 characters long');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Encrypts a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string encrypted with encrypt()
 */
export function decrypt(encryptedText: string): string {
  try {
    const buffer = Buffer.from(encryptedText, 'base64');
    
    const salt = buffer.slice(0, SALT_LENGTH);
    const iv = buffer.slice(SALT_LENGTH, TAG_POSITION);
    const tag = buffer.slice(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = buffer.slice(ENCRYPTED_POSITION);
    
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypts an object by converting it to JSON first
 */
export function encryptObject<T extends Record<string, any>>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts an object that was encrypted with encryptObject
 */
export function decryptObject<T extends Record<string, any>>(encryptedText: string): T {
  return JSON.parse(decrypt(encryptedText));
}