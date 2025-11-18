import crypto from 'crypto'

// Get encryption key from environment variable
// IMPORTANT: Generate a secure key with: openssl rand -hex 32
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn('WARNING: ENCRYPTION_KEY not set or invalid. Token encryption will not work.')
}

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * Encrypts sensitive data (like OAuth tokens)
 * @param text - The plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) return ''
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured')

  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Return in format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts encrypted data
 * @param encryptedText - The encrypted string in format: iv:authTag:encrypted
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return ''
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured')

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format')
    }

    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Utility to generate a new encryption key
 * Run this once and save the output to your .env file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
