export type VowelType = "long" | "short" | "special";
export type VowelGroup = "basic" | "mid" | "complex" | "diphthong" | "special";

export interface Vowel {
  thai: string;
  sound: string;
  type: VowelType;
  group: VowelGroup;
}

// 12 pairs of long and short vowels
export const vowels: Vowel[] = [
  // Group 1: Basic Simple Vowels (3 pairs)
  // Pair 1: อา / อะ
  { thai: "อา", sound: "/aː/", type: "long", group: "basic" },
  { thai: "อะ", sound: "/a/", type: "short", group: "basic" },
  
  // Pair 2: อี / อิ
  { thai: "อี", sound: "/iː/", type: "long", group: "basic" },
  { thai: "อิ", sound: "/i/", type: "short", group: "basic" },
  
  // Pair 3: อู / อุ
  { thai: "อู", sound: "/uː/", type: "long", group: "basic" },
  { thai: "อุ", sound: "/u/", type: "short", group: "basic" },
  
  // Group 2: Mid-Level Vowels (4 pairs)
  // Pair 4: เอ / เอะ
  { thai: "เอ", sound: "/eː/", type: "long", group: "mid" },
  { thai: "เอะ", sound: "/e/", type: "short", group: "mid" },
  
  // Pair 5: แอ / แอะ
  { thai: "แอ", sound: "/ɛː/", type: "long", group: "mid" },
  { thai: "แอะ", sound: "/ɛ/", type: "short", group: "mid" },
  
  // Pair 6: โอ / โอะ
  { thai: "โอ", sound: "/oː/", type: "long", group: "mid" },
  { thai: "โอะ", sound: "/o/", type: "short", group: "mid" },
  
  // Pair 7: ออ / เอาะ
  { thai: "ออ", sound: "/ɔː/", type: "long", group: "mid" },
  { thai: "เอาะ", sound: "/ɔ/", type: "short", group: "mid" },
  
  // Group 3: Complex Vowels (4 pairs)
  // Pair 8: เออ / เออะ
  { thai: "เออ", sound: "/ɤː/", type: "long", group: "complex" },
  { thai: "เออะ", sound: "/ɤ/", type: "short", group: "complex" },
  
  // Pair 9: เอีย / เอียะ
  { thai: "เอีย", sound: "/iaː/", type: "long", group: "complex" },
  { thai: "เอียะ", sound: "/ia/", type: "short", group: "complex" },
  
  // Pair 10: เอือ / เอือะ
  { thai: "เอือ", sound: "/ɯaː/", type: "long", group: "complex" },
  { thai: "เอือะ", sound: "/ɯa/", type: "short", group: "complex" },
  
  // Pair 11: อัว / อัวะ
  { thai: "อัว", sound: "/uaː/", type: "long", group: "complex" },
  { thai: "อัวะ", sound: "/ua/", type: "short", group: "complex" },
  
  // Group 4: Diphthongs (1 pair)
  // Pair 12: เอา / เอาะ (Note: เอาะ is also used with ออ, but เอา is a distinct long vowel)
  { thai: "เอา", sound: "/au/", type: "long", group: "diphthong" },
  { thai: "เอาะ", sound: "/ɔ/", type: "short", group: "diphthong" },
];

// 8 Special Vowel Symbols
export const specialVowels: Vowel[] = [
  { thai: "ฤ", sound: "/rɯ/", type: "special", group: "special" },
  { thai: "ฤา", sound: "/rɯː/", type: "special", group: "special" },
  { thai: "ฦ", sound: "/lɯ/", type: "special", group: "special" },
  { thai: "ฦา", sound: "/lɯː/", type: "special", group: "special" },
  { thai: "ใ", sound: "/ai/", type: "special", group: "special" },
  { thai: "ไ", sound: "/ai/", type: "special", group: "special" },
  { thai: "ำ", sound: "/am/", type: "special", group: "special" },
  { thai: "ๅ", sound: "/aː/", type: "special", group: "special" },
];

// Helper function to get vowel pairs
export const getVowelPairs = () => {
  const longVowels = vowels.filter(v => v.type === "long");
  const shortVowels = vowels.filter(v => v.type === "short");
  
  return longVowels.map((long, index) => ({
    long,
    short: shortVowels[index],
  }));
};

// Helper function to get group label
export const getGroupLabel = (group: VowelGroup): string => {
  const labelMap: Record<VowelGroup, string> = {
    basic: "Basic Simple Vowels",
    mid: "Mid-Level Vowels",
    complex: "Complex Vowels",
    diphthong: "Diphthongs",
    special: "Special Symbols",
  };
  return labelMap[group];
};

// Helper function to get group description
export const getGroupDescription = (group: VowelGroup): string => {
  const descMap: Record<VowelGroup, string> = {
    basic: "Single-character vowels",
    mid: "Two-character vowels",
    complex: "Three-character vowels",
    diphthong: "Combined vowel sounds",
    special: "Rare or special cases",
  };
  return descMap[group];
};

// Group order for display
export const groupOrder: VowelGroup[] = ["basic", "mid", "complex", "diphthong", "special"];

