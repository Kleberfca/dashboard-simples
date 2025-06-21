// src/lib/crypto/encryption.ts
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const keyLength = 32 // 256 bits
const ivLength = 16 // 128 bits
const tagLength = 16 // 128 bits
const saltLength = 64 // 512 bits
const tagPosition = saltLength + ivLength
const encryptedPosition = tagPosition + tagLength

/**
 * Deriva uma chave a partir da chave de criptografia e um salt
 */
function deriveKey(salt: Buffer): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== keyLength) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters')
  }
  
  return crypto.pbkdf2Sync(key, salt, 100000, keyLength, 'sha256')
}

/**
 * Criptografa um texto usando AES-256-GCM
 */
export function encrypt(text: string): string {
  try {
    // Gerar salt e IV aleatórios
    const salt = crypto.randomBytes(saltLength)
    const iv = crypto.randomBytes(ivLength)
    
    // Derivar chave
    const key = deriveKey(salt)
    
    // Criar cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    
    // Criptografar
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ])
    
    // Obter tag de autenticação
    const tag = cipher.getAuthTag()
    
    // Combinar salt + iv + tag + encrypted
    const combined = Buffer.concat([salt, iv, tag, encrypted])
    
    // Retornar como base64
    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Descriptografa um texto criptografado com AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  try {
    // Converter de base64
    const combined = Buffer.from(encryptedText, 'base64')
    
    // Extrair componentes
    const salt = combined.slice(0, saltLength)
    const iv = combined.slice(saltLength, tagPosition)
    const tag = combined.slice(tagPosition, encryptedPosition)
    const encrypted = combined.slice(encryptedPosition)
    
    // Derivar chave
    const key = deriveKey(salt)
    
    // Criar decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAuthTag(tag)
    
    // Descriptografar
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])
    
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Criptografa um objeto JavaScript
 */
export function encryptObject(obj: Record<string, any>): string {
  try {
    const jsonString = JSON.stringify(obj)
    return encrypt(jsonString)
  } catch (error) {
    console.error('Object encryption error:', error)
    throw new Error('Failed to encrypt object')
  }
}

/**
 * Descriptografa para um objeto JavaScript
 */
export function decryptObject(encryptedText: string): Record<string, any> {
  try {
    const jsonString = decrypt(encryptedText)
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Object decryption error:', error)
    throw new Error('Failed to decrypt object')
  }
}

/**
 * Hash de senha usando bcrypt-like approach com crypto nativo
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')
  return salt.toString('hex') + ':' + hash.toString('hex')
}

/**
 * Verifica senha contra hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512')
  return hash === verifyHash.toString('hex')
}

/**
 * Gera um token seguro
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Gera um ID único
 */
export function generateUniqueId(): string {
  return crypto.randomUUID()
}