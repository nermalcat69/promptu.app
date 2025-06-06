import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface UserInfo {
  name?: string;
  email?: string;
  // GitHub specific
  login?: string;
  // Google specific
  given_name?: string;
  family_name?: string;
}

// Clean and format username
function cleanUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric chars
    .substring(0, 20) // Limit length
    .replace(/^[0-9]+/, ''); // Remove leading numbers
}

// Generate variations of a base username
function generateUsernameVariations(baseUsername: string): string[] {
  const variations = [baseUsername];
  
  // Add numbers 1-9
  for (let i = 1; i <= 9; i++) {
    variations.push(`${baseUsername}${i}`);
  }
  
  // Add random numbers for more variations
  for (let i = 0; i < 5; i++) {
    const randomNum = Math.floor(Math.random() * 99) + 10;
    variations.push(`${baseUsername}${randomNum}`);
  }
  
  return variations;
}

// Check if username is available
async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username || username.length < 3) return false;
  
  try {
    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, username))
      .limit(1);
    
    return existing.length === 0;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

// Extract potential usernames from user info
function extractPotentialUsernames(userInfo: UserInfo): string[] {
  const potentials: string[] = [];
  
  // Try GitHub login first (usually the best option)
  if (userInfo.login) {
    potentials.push(cleanUsername(userInfo.login));
  }
  
  // Try email username part
  if (userInfo.email) {
    const emailUsername = userInfo.email.split('@')[0];
    potentials.push(cleanUsername(emailUsername));
  }
  
  // Try first name + last name
  if (userInfo.given_name && userInfo.family_name) {
    const fullName = `${userInfo.given_name}${userInfo.family_name}`;
    potentials.push(cleanUsername(fullName));
  }
  
  // Try just first name
  if (userInfo.given_name) {
    potentials.push(cleanUsername(userInfo.given_name));
  }
  
  // Try full name (fallback)
  if (userInfo.name) {
    const cleanedName = cleanUsername(userInfo.name.replace(/\s+/g, ''));
    potentials.push(cleanedName);
    
    // Also try first word of name
    const firstName = userInfo.name.split(' ')[0];
    if (firstName) {
      potentials.push(cleanUsername(firstName));
    }
  }
  
  // Remove duplicates and filter valid ones
  return [...new Set(potentials)].filter(username => 
    username.length >= 3 && username.length <= 20
  );
}

// Main function to generate available username
export async function generateAvailableUsername(userInfo: UserInfo): Promise<string | null> {
  try {
    const potentialUsernames = extractPotentialUsernames(userInfo);
    
    // Try each potential username with variations
    for (const baseUsername of potentialUsernames) {
      const variations = generateUsernameVariations(baseUsername);
      
      for (const variation of variations) {
        if (await isUsernameAvailable(variation)) {
          return variation;
        }
      }
    }
    
    // Fallback: generate a random username
    const fallbackBase = 'user';
    const fallbackVariations = generateUsernameVariations(fallbackBase);
    
    for (const variation of fallbackVariations) {
      if (await isUsernameAvailable(variation)) {
        return variation;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error generating username:', error);
    return null;
  }
}

// Suggest usernames for user to choose from
export async function suggestUsernames(userInfo: UserInfo, count: number = 3): Promise<string[]> {
  try {
    const potentialUsernames = extractPotentialUsernames(userInfo);
    const suggestions: string[] = [];
    
    for (const baseUsername of potentialUsernames) {
      if (suggestions.length >= count) break;
      
      const variations = generateUsernameVariations(baseUsername);
      
      for (const variation of variations) {
        if (suggestions.length >= count) break;
        
        if (await isUsernameAvailable(variation)) {
          suggestions.push(variation);
        }
      }
    }
    
    // Fill remaining with fallback suggestions
    if (suggestions.length < count) {
      const fallbackBase = 'user';
      const fallbackVariations = generateUsernameVariations(fallbackBase);
      
      for (const variation of fallbackVariations) {
        if (suggestions.length >= count) break;
        
        if (await isUsernameAvailable(variation) && !suggestions.includes(variation)) {
          suggestions.push(variation);
        }
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error suggesting usernames:', error);
    return [];
  }
} 