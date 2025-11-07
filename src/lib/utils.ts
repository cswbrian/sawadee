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
