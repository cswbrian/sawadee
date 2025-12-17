import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getStats, getCorrectPercentage, type QuizType } from "./stats"
import type { Consonant, ConsonantClass } from "@/data/consonants"
import type { Vowel } from "@/data/vowels"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to sort items by familiarity (least correct first)
export const sortByFamiliarity = <T extends { thai: string }>(
  items: T[],
  quizType: QuizType
): T[] => {
  return [...items].sort((a, b) => {
    const statsA = getStats(quizType, a.thai);
    const statsB = getStats(quizType, b.thai);
    
    const percentageA = getCorrectPercentage(statsA) ?? -1; // -1 for no data
    const percentageB = getCorrectPercentage(statsB) ?? -1;
    
    // Sort: no data last, then by percentage (ascending = least correct first)
    if (percentageA === -1 && percentageB === -1) return 0;
    if (percentageA === -1) return 1;
    if (percentageB === -1) return -1;
    
    return percentageA - percentageB;
  });
};

// Helper function to get familiarity percentage for display
export const getFamiliarityPercentage = (
  quizType: QuizType,
  thai: string
): number | null => {
  const stats = getStats(quizType, thai);
  return getCorrectPercentage(stats);
};

// Thai characters that are prefix vowels (written before the consonant)
const THAI_PREFIX_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ']);

// Thai characters that typically cannot start a syllable (vowels/tones that follow a consonant)
const THAI_DEPENDENT_CHARS = new Set([
  'ะ', 'ั', 'า', 'ำ', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', 'ฺ', 
  '็', '่', '้', '๊', '๋', '์'
]);

// Helper function to break down Thai word into syllables with dots
// Uses phonetic to guide syllable boundaries and Thai orthography rules
export const breakDownThaiWord = (thai: string, phonetic?: string): string => {
  if (!phonetic) {
    return thai;
  }

  const syllableCount = phonetic.split('-').length;
  if (syllableCount <= 1) {
    return thai;
  }

  const thaiChars = Array.from(thai);
  const totalChars = thaiChars.length;
  
  // 1. Calculate initial split points based on length heuristic
  const splitIndices: number[] = [];
  let currentIndex = 0;
  
  for (let i = 0; i < syllableCount - 1; i++) {
    const remainingSyllables = syllableCount - i;
    const remainingChars = totalChars - currentIndex;
    
    let charCount = Math.floor(remainingChars / remainingSyllables);
    charCount = Math.min(charCount, remainingChars - (remainingSyllables - 1));
    charCount = Math.max(1, charCount);
    
    currentIndex += charCount;
    splitIndices.push(currentIndex);
  }

  // 2. Adjust split points based on Thai orthography rules
  // We iterate backwards to allow shifting left to propagate if needed, 
  // though typically local adjustments suffice.
  for (let i = 0; i < splitIndices.length; i++) {
    let splitPoint = splitIndices[i];
    
    // Safety break to prevent infinite loops (though unlikely with simple decrements)
    let attempts = 0;
    
    // Phase 1: Shift Left checks (Correction for splitting too late)
    while (splitPoint > 0 && attempts < 5) {
      const prevChar = thaiChars[splitPoint - 1];
      const currChar = thaiChars[splitPoint];
      
      let shouldShiftLeft = false;

      // Rule A: Don't split after a prefix vowel (e.g. "...เ | ข...")
      // The prefix vowel belongs to the NEXT syllable.
      if (THAI_PREFIX_VOWELS.has(prevChar)) {
        shouldShiftLeft = true;
      }

      // Rule B: Don't split before a dependent char (e.g. "...ต | ้...")
      // The dependent char belongs to the PREVIOUS syllable.
      if (THAI_DEPENDENT_CHARS.has(currChar)) {
        shouldShiftLeft = true;
      }

      if (shouldShiftLeft) {
        splitPoint--;
        attempts++;
      } else {
        break;
      }
    }

    // Phase 2: Shift Right checks (Correction for splitting too early)
    // Only if we haven't shifted left (usually mutually exclusive)
    attempts = 0;
    while (splitPoint < totalChars - 1 && attempts < 5) {
      const currChar = thaiChars[splitPoint];
      const nextChar = thaiChars[splitPoint + 1];
      
      let shouldShiftRight = false;
      
      // Rule C: If current char is a consonant (not prefix/dependent) 
      // AND next char is a prefix vowel, the consonant likely ends the previous syllable.
      // e.g. "พริกเผา" -> split at "พริ | กเผา" -> shift right to "พริก | เผา"
      const isCurrConsonant = !THAI_PREFIX_VOWELS.has(currChar) && !THAI_DEPENDENT_CHARS.has(currChar);
      
      if (isCurrConsonant && THAI_PREFIX_VOWELS.has(nextChar)) {
        shouldShiftRight = true;
      }
      
      if (shouldShiftRight) {
        splitPoint++;
        attempts++;
      } else {
        break;
      }
    }
    
    splitIndices[i] = splitPoint;
  }

  // 3. Construct the result string
  const result: string[] = [];
  let lastSplit = 0;
  
  for (const splitPoint of splitIndices) {
    result.push(thaiChars.slice(lastSplit, splitPoint).join(''));
    result.push('.');
    lastSplit = splitPoint;
  }
  result.push(thaiChars.slice(lastSplit).join(''));
  
  return result.join('');
};

/**
 * Calculate Thai tone for a single syllable
 * @param syllableThai Thai text of the syllable
 * @param consonants Array of consonant data
 * @returns Tone as "M", "1", "2", "3", or "4"
 */
export const calculateThaiTone = (
  syllableThai: string,
  consonants: Consonant[]
): string => {
  // Check for tone marks first (they override everything)
  const hasMaiEk = syllableThai.includes('่');
  const hasMaiTho = syllableThai.includes('้');
  const hasMaiTri = syllableThai.includes('๊');
  const hasMaiChattawa = syllableThai.includes('๋');

  // Find the first consonant in the syllable
  let firstConsonant: Consonant | undefined;
  const thaiChars = Array.from(syllableThai);
  
  for (const char of thaiChars) {
    if (THAI_PREFIX_VOWELS.has(char) || THAI_DEPENDENT_CHARS.has(char)) {
      continue;
    }
    firstConsonant = consonants.find(c => c.thai === char);
    if (firstConsonant) break;
  }

  // If no consonant found, default to mid class
  const consonantClass: ConsonantClass = firstConsonant?.class || "mid";

  // Determine vowel length (simplified - check for long vowel patterns)
  // Long vowels typically have more characters or specific patterns
  const hasLongVowel = syllableThai.match(/[าเแโอ]/) !== null || 
                       syllableThai.match(/เ-[ียือ]/) !== null ||
                       syllableThai.match(/[ัว]/) !== null;
  
  // Check if syllable ends with dead ending (k, p, t sounds)
  // This is simplified - in reality we'd need to parse the final consonant sound
  // For now, we'll check if it ends with characters that typically represent dead endings
  const deadEndingChars = ['ก', 'ข', 'ค', 'ฆ', 'บ', 'ป', 'พ', 'ฟ', 'ภ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'จ', 'ช', 'ซ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ศ', 'ษ', 'ส'];
  const lastChar = thaiChars[thaiChars.length - 1];
  const isDeadEnding = deadEndingChars.includes(lastChar) && !hasLongVowel;

  // Apply tone rules
  // If tone mark is present, it overrides
  if (hasMaiEk) {
    if (consonantClass === "mid") return "1";
    if (consonantClass === "high") return "2";
    if (consonantClass === "low") return "2";
  }
  if (hasMaiTho) {
    if (consonantClass === "mid") return "2";
    if (consonantClass === "high") return "3";
    if (consonantClass === "low") return "3";
  }
  if (hasMaiTri) {
    return "3";
  }
  if (hasMaiChattawa) {
    return "4";
  }

  // No tone mark - apply standard rules
  if (consonantClass === "mid") {
    if (hasLongVowel && !isDeadEnding) return "M";
    if (hasLongVowel && isDeadEnding) return "1";
    if (!hasLongVowel && isDeadEnding) return "1";
    return "M"; // Default for mid class
  }

  if (consonantClass === "high") {
    if (hasLongVowel && !isDeadEnding) return "3";
    if (hasLongVowel && isDeadEnding) return "2";
    if (!hasLongVowel && isDeadEnding) return "2";
    return "3"; // Default for high class
  }

  if (consonantClass === "low") {
    if (hasLongVowel && !isDeadEnding) return "1";
    if (hasLongVowel && isDeadEnding) return "3";
    if (!hasLongVowel && isDeadEnding) return "3";
    return "1"; // Default for low class
  }

  return "M"; // Fallback
};

/**
 * Calculate tones for all syllables in a word
 * @param thai Thai text of the word
 * @param phonetic Phonetic transcription (e.g., "sa-wat-dee")
 * @param consonants Array of consonant data
 * @param vowels Array of vowel data
 * @param storedTone Optional stored tone string (e.g., "M-2-M")
 * @returns Array of syllable-tone pairs
 */
export const calculateWordTones = (
  thai: string,
  phonetic: string,
  consonants: Consonant[],
  _vowels: Vowel[],
  storedTone?: string
): Array<{ syllable: string; tone: string }> => {
  // If stored tone is provided, use it
  if (storedTone) {
    const phoneticSyllables = phonetic.split('-');
    const toneSyllables = storedTone.split('-');
    
    return phoneticSyllables.map((syllable, index) => ({
      syllable: syllable.trim(),
      tone: toneSyllables[index]?.trim() || "M"
    }));
  }

  // Otherwise, calculate tones for each syllable
  const phoneticSyllables = phonetic.split('-');
  
  // Split Thai text into syllables (simplified approach)
  // This is a complex problem - for now, we'll try to match syllables
  // by approximating based on phonetic syllable count
  const thaiChars = Array.from(thai);
  const syllableCount = phoneticSyllables.length;
  
  // For multi-syllable words, we need to split the Thai text
  // This is simplified - a full implementation would need proper syllable parsing
  const result: Array<{ syllable: string; tone: string }> = [];
  
  if (syllableCount === 1) {
    // Single syllable - use entire Thai text
    const tone = calculateThaiTone(thai, consonants);
    result.push({
      syllable: phoneticSyllables[0],
      tone
    });
  } else {
    // Multi-syllable - approximate syllable boundaries
    // This is a simplified approach - ideally we'd use proper Thai syllable parsing
    const charsPerSyllable = Math.ceil(thaiChars.length / syllableCount);
    let currentIndex = 0;
    
    for (let i = 0; i < syllableCount; i++) {
      const isLast = i === syllableCount - 1;
      const endIndex = isLast ? thaiChars.length : Math.min(currentIndex + charsPerSyllable, thaiChars.length);
      const syllableThai = thaiChars.slice(currentIndex, endIndex).join('');
      
      const tone = calculateThaiTone(syllableThai, consonants);
      result.push({
        syllable: phoneticSyllables[i],
        tone
      });
      
      currentIndex = endIndex;
    }
  }
  
  return result;
};

/**
 * Format phonetic with tones for display
 * Returns an array of syllable-tone pairs ready for rendering
 */
export const formatPhoneticWithTones = (
  phonetic: string,
  syllableTones: Array<{ syllable: string; tone: string }>
): Array<{ syllable: string; tone: string }> => {
  // Match phonetic syllables with calculated tones
  const phoneticSyllables = phonetic.split('-');
  return phoneticSyllables.map((syllable, index) => ({
    syllable: syllable.trim(),
    tone: syllableTones[index]?.tone || "M"
  }));
};
