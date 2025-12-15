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
  { thai: "โชคดี", phonetic: "chok-dee", meaning: "Good luck", category: "greetings" },
  { thai: "ยินดีที่ได้รู้จัก", phonetic: "yin-dee-tee-dai-roo-jak", meaning: "Nice to meet you", category: "greetings" },
  { thai: "ลาจ่อน", phonetic: "la-gon", meaning: "Goodbye (formal)", category: "greetings" },
  { thai: "พบกันใหม่", phonetic: "phob-kan-mai", meaning: "See you again", category: "greetings" },
  { thai: "ราตรีสวัสดิ์", phonetic: "ra-tree-sa-wat", meaning: "Good night", category: "greetings" },

  { thai: "ใช่", phonetic: "chai", meaning: "Yes", category: "basics" },
  { thai: "ไม่", phonetic: "mai", meaning: "No", category: "basics" },
  { thai: "ไม่ใช่", phonetic: "mai-chai", meaning: "No (not correct)", category: "basics" },
  { thai: "ชื่ออะไร", phonetic: "chue-arai", meaning: "What is your name?", category: "basics" },
  { thai: "ไม่เข้าใจ", phonetic: "mai-khao-jai", meaning: "I don't understand", category: "basics" },
  { thai: "เข้าใจ", phonetic: "khao-jai", meaning: "I understand", category: "basics" },
  { thai: "พูดภาษาอังกฤษได้ไหม", phonetic: "phut-pa-sa-ang-krit-dai-mai", meaning: "Can you speak English?", category: "basics" },
  { thai: "นิดหน่อย", phonetic: "nit-noi", meaning: "A little bit", category: "basics" },
  { thai: "อะไร", phonetic: "a-rai", meaning: "What?", category: "basics" },
  { thai: "ที่ไหน", phonetic: "tee-nai", meaning: "Where?", category: "basics" },
  { thai: "เมื่อไหร่", phonetic: "muea-rai", meaning: "When?", category: "basics" },
  { thai: "ทำไม", phonetic: "tham-mai", meaning: "Why?", category: "basics" },
  
  // Food
  { thai: "ข้าว", phonetic: "khao", meaning: "Rice / Food", category: "food" },
  { thai: "ไก่", phonetic: "kai", meaning: "Chicken", category: "food" },
  { thai: "หมู", phonetic: "moo", meaning: "Pork", category: "food" },
  { thai: "เนื้อ", phonetic: "nuea", meaning: "Beef", category: "food" },
  { thai: "กุ้ง", phonetic: "kung", meaning: "Shrimp", category: "food" },
  { thai: "ปลา", phonetic: "pla", meaning: "Fish", category: "food" },
  { thai: "ไข่", phonetic: "khai", meaning: "Egg", category: "food" },
  { thai: "ผัก", phonetic: "phak", meaning: "Vegetable", category: "food" },
  { thai: "ผลไม้", phonetic: "phon-la-mai", meaning: "Fruit", category: "food" },
  { thai: "ผัดไทย", phonetic: "pad-thai", meaning: "Pad Thai", category: "food" },
  { thai: "ส้มตำ", phonetic: "som-tam", meaning: "Papaya Salad", category: "food" },
  { thai: "ต้มยำกุ้ง", phonetic: "tom-yum-kung", meaning: "Spicy Shrimp Soup", category: "food" },
  { thai: "ข้าวผัด", phonetic: "khao-pad", meaning: "Fried Rice", category: "food" },
  { thai: "แกงเขียวหวาน", phonetic: "kaeng-khiao-wan", meaning: "Green Curry", category: "food" },
  { thai: "แกงมัสมั่น", phonetic: "kaeng-mat-sa-man", meaning: "Massaman Curry", category: "food" },
  { thai: "พะแนง", phonetic: "pha-naeng", meaning: "Panang Curry", category: "food" },
  { thai: "ผัดกะเพรา", phonetic: "pad-kra-pao", meaning: "Holy Basil Stir-fry", category: "food" },
  { thai: "ต้มข่าไก่", phonetic: "tom-kha-kai", meaning: "Chicken Coconut Soup", category: "food" },
  { thai: "ผัดซีอิ๊ว", phonetic: "pad-see-ew", meaning: "Stir-fried Soy Sauce Noodles", category: "food" },
  { thai: "ข้าวซอย", phonetic: "khao-soi", meaning: "Northern Curry Noodles", category: "food" },
  { thai: "หมูปิ้ง", phonetic: "moo-ping", meaning: "Grilled Pork Skewers", category: "food" },
  { thai: "ลาบ", phonetic: "larb", meaning: "Spicy Minced Meat Salad", category: "food" },
  { thai: "ไข่เจียว", phonetic: "khai-jiao", meaning: "Omelette", category: "food" },
  { thai: "โจ๊ก", phonetic: "jok", meaning: "Rice Porridge", category: "food" },
  { thai: "สะเต๊ะ", phonetic: "sa-te", meaning: "Satay", category: "food" },
  { thai: "ผัดผักบุ้งไฟแดง", phonetic: "pad-phak-bung-fai-daeng", meaning: "Stir-fried Morning Glory", category: "food" },
  { thai: "ข้าวเหนียวมะม่วง", phonetic: "khao-niao-ma-muang", meaning: "Mango Sticky Rice", category: "food" },
  { thai: "เผ็ด", phonetic: "phet", meaning: "Spicy", category: "food" },
  { thai: "ไม่เผ็ด", phonetic: "mai-phet", meaning: "Not spicy", category: "food" },
  { thai: "อร่อย", phonetic: "a-roi", meaning: "Delicious", category: "food" },
  { thai: "หิว", phonetic: "hiw", meaning: "Hungry", category: "food" },
  { thai: "อิ่ม", phonetic: "im", meaning: "Full", category: "food" },
  
  // Drink
  { thai: "น้ำ", phonetic: "nam", meaning: "Water", category: "drink" },
  { thai: "น้ำแข็ง", phonetic: "nam-khaeng", meaning: "Ice", category: "drink" },
  { thai: "กาแฟ", phonetic: "ka-fae", meaning: "Coffee", category: "drink" },
  { thai: "ชา", phonetic: "cha", meaning: "Tea", category: "drink" },
  { thai: "ชาไทย", phonetic: "cha-thai", meaning: "Thai Milk Tea", category: "drink" },
  { thai: "นม", phonetic: "nom", meaning: "Milk", category: "drink" },
  { thai: "เบียร์", phonetic: "bia", meaning: "Beer", category: "drink" },
  { thai: "น้ำผลไม้", phonetic: "nam-phon-la-mai", meaning: "Fruit Juice", category: "drink" },
  { thai: "กาแฟเย็น", phonetic: "ka-fae-yen", meaning: "Iced Coffee", category: "drink" },
  { thai: "ชาเย็น", phonetic: "cha-yen", meaning: "Iced Tea (Thai Tea)", category: "drink" },
  { thai: "แก้ว", phonetic: "kaew", meaning: "Glass / Cup", category: "drink" },
  { thai: "ขวด", phonetic: "khuat", meaning: "Bottle", category: "drink" },
  
  // Places
  { thai: "ห้องน้ำ", phonetic: "hong-nam", meaning: "Toilet / Restroom", category: "places" },
  { thai: "โรงแรม", phonetic: "rong-raem", meaning: "Hotel", category: "places" },
  { thai: "ร้านอาหาร", phonetic: "ran-a-han", meaning: "Restaurant", category: "places" },
  { thai: "สนามบิน", phonetic: "sa-nam-bin", meaning: "Airport", category: "places" },
  { thai: "โรงพยาบาล", phonetic: "rong-pha-ya-ban", meaning: "Hospital", category: "places" },
  { thai: "ตลาด", phonetic: "ta-lat", meaning: "Market", category: "places" },
  { thai: "ร้านขายยา", phonetic: "ran-khai-ya", meaning: "Pharmacy", category: "places" },
  { thai: "ธนาคาร", phonetic: "tha-na-khan", meaning: "Bank", category: "places" },
  { thai: "สถานีตำรวจ", phonetic: "sa-tha-ni-tam-ruat", meaning: "Police Station", category: "places" },
  { thai: "วัด", phonetic: "wat", meaning: "Temple", category: "places" },
  { thai: "บ้าน", phonetic: "ban", meaning: "House / Home", category: "places" },
  { thai: "โรงเรียน", phonetic: "rong-rian", meaning: "School", category: "places" },
  
  // Directions
  { thai: "ซ้าย", phonetic: "sai", meaning: "Left", category: "directions" },
  { thai: "ขวา", phonetic: "khwa", meaning: "Right", category: "directions" },
  { thai: "ตรงไป", phonetic: "trong-pai", meaning: "Go straight", category: "directions" },
  { thai: "หยุด", phonetic: "yut", meaning: "Stop", category: "directions" },
  { thai: "ไกล", phonetic: "klai", meaning: "Far", category: "directions" },
  { thai: "ใกล้", phonetic: "klai", meaning: "Near", category: "directions" },
  { thai: "เลี้ยว", phonetic: "liao", meaning: "Turn", category: "directions" },
  { thai: "กลับรถ", phonetic: "klap-rot", meaning: "U-turn", category: "directions" },
  { thai: "ข้างหน้า", phonetic: "khang-na", meaning: "In front", category: "directions" },
  { thai: "ข้างหลัง", phonetic: "khang-lang", meaning: "Behind", category: "directions" },
  { thai: "ทางนี้", phonetic: "thang-nee", meaning: "This way", category: "directions" },
  { thai: "หลงทาง", phonetic: "long-thang", meaning: "Lost (way)", category: "directions" },
  
  // Shopping
  { thai: "เท่าไหร่", phonetic: "tao-rai", meaning: "How much?", category: "shopping" },
  { thai: "แพง", phonetic: "phaeng", meaning: "Expensive", category: "shopping" },
  { thai: "ถูก", phonetic: "thook", meaning: "Cheap", category: "shopping" },
  { thai: "ลดได้ไหม", phonetic: "lot-dai-mai", meaning: "Can you give a discount?", category: "shopping" },
  { thai: "เอา", phonetic: "ao", meaning: "I want / I'll take it", category: "shopping" },
  { thai: "ไม่เอา", phonetic: "mai-ao", meaning: "I don't want it", category: "shopping" },
  { thai: "มีไหม", phonetic: "mee-mai", meaning: "Do you have...?", category: "shopping" },
  { thai: "ไม่มี", phonetic: "mai-mee", meaning: "Don't have", category: "shopping" },
  { thai: "เงินสด", phonetic: "ngoen-sot", meaning: "Cash", category: "shopping" },
  { thai: "บัตรเครดิต", phonetic: "bat-khre-dit", meaning: "Credit Card", category: "shopping" },
  { thai: "ใบเสร็จ", phonetic: "bai-set", meaning: "Receipt", category: "shopping" },
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

