// Stats storage utilities for tracking user performance
export type QuizType = 
  | "initial_consonant"
  | "final_consonant"
  | "vowel"
  | "number";

export interface LetterStats {
  attempts: number;
  correct: number;
}

export type LetterStatsMap = Record<string, LetterStats>;

// Generate localStorage key for a specific quiz type
const getStatsKey = (quizType: QuizType): string => {
  return `sawadee_${quizType}_stats_v1`;
};

// Load all stats for a specific quiz type from localStorage
export const loadStats = (quizType: QuizType): LetterStatsMap => {
  try {
    const key = getStatsKey(quizType);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error loading stats for ${quizType}:`, error);
  }
  return {};
};

// Save all stats for a specific quiz type to localStorage
export const saveStats = (quizType: QuizType, stats: LetterStatsMap): void => {
  try {
    const key = getStatsKey(quizType);
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.error(`Error saving stats for ${quizType}:`, error);
  }
};

// Record an answer for a letter/item in a specific quiz type
export const recordAnswer = (
  quizType: QuizType,
  letterId: string,
  isCorrect: boolean
): void => {
  const stats = loadStats(quizType);
  const current = stats[letterId] || { attempts: 0, correct: 0 };
  
  stats[letterId] = {
    attempts: current.attempts + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
  };
  
  saveStats(quizType, stats);
};

// Get stats for a specific letter/item in a quiz type
export const getStats = (
  quizType: QuizType,
  letterId: string
): LetterStats | null => {
  const stats = loadStats(quizType);
  return stats[letterId] || null;
};

// Calculate correct percentage for a letter/item
export const getCorrectPercentage = (
  stats: LetterStats | null
): number | null => {
  if (!stats || stats.attempts === 0) {
    return null;
  }
  return (stats.correct / stats.attempts) * 100;
};

// Calculate weight for a letter/item based on stats
// Returns 3x for < 50% correct (with at least 3 attempts)
// Returns 1.5x for 50-70% correct
// Returns 1x for > 70% correct or insufficient data
export const calculateWeight = (
  quizType: QuizType,
  letterId: string
): number => {
  const stats = getStats(quizType, letterId);
  if (!stats || stats.attempts < 3) {
    return 1.0; // Default weight for insufficient data
  }
  
  const percentage = getCorrectPercentage(stats)!;
  
  if (percentage < 50) {
    return 3.0; // High weight for letters user struggles with
  } else if (percentage < 70) {
    return 1.5; // Medium weight for letters user is learning
  } else {
    return 1.0; // Normal weight for letters user knows well
  }
};

// Weighted random selection from an array of items
// Generic function that works with any type that has an identifier property
export const selectWeighted = <T extends { thai: string }>(
  quizType: QuizType,
  items: T[],
  count: number
): T[] => {
  // Calculate weights for all items
  const weightedItems = items.map((item) => ({
    item,
    weight: calculateWeight(quizType, item.thai),
  }));
  
  // Create weighted array (repeat each item based on its weight)
  const weightedArray: T[] = [];
  weightedItems.forEach(({ item, weight }) => {
    const repeatCount = Math.ceil(weight);
    for (let i = 0; i < repeatCount; i++) {
      weightedArray.push(item);
    }
  });
  
  // Shuffle and select
  const shuffled = [...weightedArray].sort(() => Math.random() - 0.5);
  const selected: T[] = [];
  const selectedSet = new Set<string>();
  
  // Select unique items up to count
  for (const item of shuffled) {
    if (selectedSet.has(item.thai)) continue;
    selected.push(item);
    selectedSet.add(item.thai);
    if (selected.length >= count) break;
  }
  
  // If we don't have enough unique items, fill with remaining ones
  if (selected.length < count) {
    const remaining = items.filter((item) => !selectedSet.has(item.thai));
    const needed = count - selected.length;
    selected.push(...remaining.slice(0, needed));
  }
  
  return selected;
};

