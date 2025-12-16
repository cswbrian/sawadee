import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getStats, getCorrectPercentage, type QuizType } from "./stats"

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
