export type WordCategory = 
  | "greetings"
  | "basics"
  | "food"
  | "drink"
  | "places"
  | "directions"
  | "shopping";

export interface Word {
  thai: string;
  phonetic: string;
  meaning: string;
  category: WordCategory;
}

export const words: Word[] = [
  // Greetings & Basics
  { thai: "สวัสดี", phonetic: "sa-wat-dee", meaning: "Hello / Goodbye", category: "greetings" },
  { thai: "ขอบคุณ", phonetic: "khob-khun", meaning: "Thank you", category: "greetings" },
  { thai: "ขอโทษ", phonetic: "khor-thot", meaning: "Sorry / Excuse me", category: "greetings" },
  { thai: "สบายดีไหม", phonetic: "sa-bai-dee-mai", meaning: "How are you?", category: "greetings" },
  { thai: "ไม่เป็นไร", phonetic: "mai-pen-rai", meaning: "It's okay / You're welcome", category: "greetings" },
  { thai: "ใช่", phonetic: "chai", meaning: "Yes", category: "basics" },
  { thai: "ไม่", phonetic: "mai", meaning: "No", category: "basics" },
  { thai: "ไม่ใช่", phonetic: "mai-chai", meaning: "No (not correct)", category: "basics" },
  { thai: "ชื่ออะไร", phonetic: "chue-arai", meaning: "What is your name?", category: "basics" },
  { thai: "ไม่เข้าใจ", phonetic: "mai-khao-jai", meaning: "I don't understand", category: "basics" },
  
  // Food
  { thai: "ข้าว", phonetic: "khao", meaning: "Rice / Food", category: "food" },
  { thai: "ไก่", phonetic: "kai", meaning: "Chicken", category: "food" },
  { thai: "หมู", phonetic: "moo", meaning: "Pork", category: "food" },
  { thai: "เนื้อ", phonetic: "nuea", meaning: "Beef", category: "food" },
  { thai: "กุ้ง", phonetic: "kung", meaning: "Shrimp", category: "food" },
  { thai: "ปลา", phonetic: "pla", meaning: "Fish", category: "food" },
  { thai: "ผัดไทย", phonetic: "pad-thai", meaning: "Pad Thai", category: "food" },
  { thai: "ส้มตำ", phonetic: "som-tam", meaning: "Papaya Salad", category: "food" },
  { thai: "ต้มยำกุ้ง", phonetic: "tom-yum-kung", meaning: "Spicy Shrimp Soup", category: "food" },
  { thai: "เผ็ด", phonetic: "phet", meaning: "Spicy", category: "food" },
  { thai: "ไม่เผ็ด", phonetic: "mai-phet", meaning: "Not spicy", category: "food" },
  { thai: "อร่อย", phonetic: "a-roi", meaning: "Delicious", category: "food" },
  
  // Drink
  { thai: "น้ำ", phonetic: "nam", meaning: "Water", category: "drink" },
  { thai: "น้ำแข็ง", phonetic: "nam-khaeng", meaning: "Ice", category: "drink" },
  { thai: "กาแฟ", phonetic: "ka-fae", meaning: "Coffee", category: "drink" },
  { thai: "ชา", phonetic: "cha", meaning: "Tea", category: "drink" },
  { thai: "นม", phonetic: "nom", meaning: "Milk", category: "drink" },
  { thai: "เบียร์", phonetic: "bia", meaning: "Beer", category: "drink" },
  
  // Places
  { thai: "ห้องน้ำ", phonetic: "hong-nam", meaning: "Toilet / Restroom", category: "places" },
  { thai: "โรงแรม", phonetic: "rong-raem", meaning: "Hotel", category: "places" },
  { thai: "ร้านอาหาร", phonetic: "ran-a-han", meaning: "Restaurant", category: "places" },
  { thai: "สนามบิน", phonetic: "sa-nam-bin", meaning: "Airport", category: "places" },
  { thai: "โรงพยาบาล", phonetic: "rong-pha-ya-ban", meaning: "Hospital", category: "places" },
  { thai: "ตลาด", phonetic: "ta-lat", meaning: "Market", category: "places" },
  
  // Directions
  { thai: "ซ้าย", phonetic: "sai", meaning: "Left", category: "directions" },
  { thai: "ขวา", phonetic: "khwa", meaning: "Right", category: "directions" },
  { thai: "ตรงไป", phonetic: "trong-pai", meaning: "Go straight", category: "directions" },
  { thai: "หยุด", phonetic: "yut", meaning: "Stop", category: "directions" },
  { thai: "ไกล", phonetic: "klai", meaning: "Far", category: "directions" },
  { thai: "ใกล้", phonetic: "klai", meaning: "Near", category: "directions" }, // Tone difference is tricky but useful context
  
  // Shopping
  { thai: "เท่าไหร่", phonetic: "tao-rai", meaning: "How much?", category: "shopping" },
  { thai: "แพง", phonetic: "phaeng", meaning: "Expensive", category: "shopping" },
  { thai: "ลดได้ไหม", phonetic: "lot-dai-mai", meaning: "Can you give a discount?", category: "shopping" },
  { thai: "เอา", phonetic: "ao", meaning: "I want / I'll take it", category: "shopping" },
  { thai: "ไม่เอา", phonetic: "mai-ao", meaning: "I don't want it", category: "shopping" },
];

export const getCategoryLabel = (category: WordCategory): string => {
  const labelMap: Record<WordCategory, string> = {
    greetings: "Greetings",
    basics: "Basics",
    food: "Food",
    drink: "Drinks",
    places: "Places",
    directions: "Directions",
    shopping: "Shopping",
  };
  return labelMap[category];
};

export const categoryOrder: WordCategory[] = [
  "greetings",
  "basics",
  "food",
  "drink",
  "shopping",
  "places",
  "directions",
];

