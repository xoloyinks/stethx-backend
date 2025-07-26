import bcrypt from 'bcrypt'
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

 async function hashPassword(password){ 
    try{ 
        // Generate a salt 
        const salt = await bcrypt.genSalt(10); 
        // Hash the password with the salt 
        const hashedPassword = await bcrypt.hash(password, salt); 
        return hashedPassword; 
    }catch (error) { 
        console.error("Error hashing password:", error); 
        throw error; 
    } 
 } 
  
 // Function to compare a password with a hashed password 
 async function comparePasswords(password, hashedPassword) { 
   try { 
     // Compare the password with the hashed password 
     const match = await bcrypt.compare(password, hashedPassword); 
     return match; 
   } catch (error) { 
     console.error("Error comparing passwords:", error); 
     return false; 
   } 
 }

// Load encryption key from environment variable (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = Buffer.from('4a7d1b3e9f2c8a0d5e6f4b321c987654fedcba9876543210abcdef0123456789', 'hex');
const IV_LENGTH = 16; // AES block size for CBC mode

// Validate encryption key
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(`Invalid ENCRYPTION_KEY length: Expected 32 bytes, got ${ENCRYPTION_KEY.length}`);
}

// Function to encrypt text
async function hashText(text) {
  try {
    // Generate a random initialization vector (IV)
    const iv = randomBytes(IV_LENGTH);
    // Create cipher with AES-256-CBC
    const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV and encrypted text
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Error encrypting text:", error);
    throw error;
  }
}

// Function to decrypt text
async function decryptText(encryptedText) {
  try {
    // Validate input format
    if (typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
      throw new Error('Invalid encrypted text format: Missing IV or ciphertext');
    }

    // Split the IV and encrypted text
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted text format: Incomplete IV or ciphertext');
    }

    // Validate hex format
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || !/^[0-9a-fA-F]+$/.test(encrypted)) {
      throw new Error('Invalid encrypted text format: Non-hex characters detected');
    }

    // Convert IV from hex to buffer
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: Expected ${IV_LENGTH} bytes, got ${iv.length}`);
    }

    // Create decipher
    const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Error decrypting text:", {
      message: error.message,
      encryptedText,
      stack: error.stack,
    });
    throw error;
  }
}

export { hashText, decryptText, comparePasswords, hashPassword};
