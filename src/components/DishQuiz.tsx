import { useMemo } from "react";
import { words, type Word } from "@/data/words";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LetterQuiz, type LetterQuizProps } from "./LetterQuiz";

const QUIZ_TYPE = "dish" as const;

// Helper to find a word object by Thai script
const findWordByThai = (thai: string) => words.find(w => w.thai === thai);

// Helper to construct a dish
const createDish = (
  prefix: Word | undefined, 
  suffix: Word, 
  englishPrefix: string, 
  englishSuffix: string,
  reverseOrder: boolean = false
): Word | null => {
  if (!prefix || !suffix) return null;

  const thai = reverseOrder ? `${suffix.thai}${prefix.thai}` : `${prefix.thai}${suffix.thai}`;
  const phonetic = reverseOrder ? `${suffix.phonetic}-${prefix.phonetic}` : `${prefix.phonetic}-${suffix.phonetic}`;
  const meaning = `${englishPrefix} ${englishSuffix}`;

  return {
    thai,
    phonetic,
    meaning,
    category: "food",
    subCategory: "dishes"
  };
};

const createDish3 = (
  p1: Word | undefined,
  p2: Word | undefined,
  p3: Word,
  eng: string
): Word | null => {
  if (!p1 || !p2 || !p3) return null;
  return {
    thai: `${p1.thai}${p2.thai}${p3.thai}`,
    phonetic: `${p1.phonetic}-${p2.phonetic}-${p3.phonetic}`,
    meaning: eng,
    category: "food",
    subCategory: "dishes"
  };
};

const DishCard = ({ word, showSound = true, showBadge = false }: { word: Word; showSound?: boolean; showBadge?: boolean }) => {
  return (
    <Card
      className="flex flex-col items-center justify-center p-3 sm:p-4 min-h-[140px] sm:min-h-[160px] w-full bg-chart-3"
    >
      <CardContent className={`flex flex-col items-center justify-center p-0 w-full ${showSound || showBadge ? 'gap-3' : ''}`}>
        <div className="text-3xl sm:text-5xl text-foreground thai-font leading-normal text-center wrap-break-word w-full px-2">
          {word.thai}
        </div>
        {showSound && (
          <div className="text-sm sm:text-base text-muted-foreground text-center font-medium">
            {word.phonetic}
          </div>
        )}
        {showBadge && (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "var(--foreground)",
              backdropFilter: "blur(4px)"
            }}
          >
            Dish
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export const DishQuiz = () => {
  // Generate valid dishes dynamically
  const dishes = useMemo(() => {
    const proteins = words.filter(w => w.subCategory === "proteins");
    const vegs = words.filter(w => w.subCategory === "vegetables");
    
    // Core words
    const wKhao = findWordByThai("ข้าว");
    const wPad = findWordByThai("ผัด");
    const wTom = findWordByThai("ต้ม");
    const wYum = findWordByThai("ยำ");
    const wKaeng = findWordByThai("แกง");
    const wYang = findWordByThai("ย่าง");
    const wTod = findWordByThai("ทอด");
    const wKraPao = findWordByThai("กะเพรา");

    const generatedDishes: Word[] = [];

    // 1. Khao Pad {Protein} (Fried Rice with X)
    proteins.forEach(p => {
      const d = createDish3(wKhao, wPad, p, `Fried Rice with ${p.meaning}`);
      if (d) generatedDishes.push(d);
    });

    // 2. Pad Kra Pao {Protein} (Stir-fried Basil with X)
    // Actually typically "Pad Kra Pao X" -> Stir-fried Holy Basil [with] X
    if (wPad && wKraPao) {
      proteins.forEach(p => {
        const d = createDish3(wPad, wKraPao, p, `Stir-fried Holy Basil with ${p.meaning}`);
        if (d) generatedDishes.push(d);
      });
    }

    // 3. Tom Yum {Protein}
    if (wTom && wYum) {
      proteins.forEach(p => {
        // Only specific proteins usually, but let's allow all for practice
        // Usually Tom Yum Goong, Gai, Talay, Pla
        if (["Chicken", "Shrimp/Prawn", "Seafood/Mix", "Fish"].includes(p.meaning)) {
          const d = createDish3(wTom, wYum, p, `Tom Yum ${p.meaning}`);
          if (d) generatedDishes.push(d);
        }
      });
    }

    // 4. Kaeng {Protein} (Curry)
    // Usually Kaeng + [Type] + [Protein], e.g. Kaeng Khiao Wan Gai
    // But "Kaeng Gai" (Chicken Curry) is valid generically
    if (wKaeng) {
      proteins.forEach(p => {
        const d = createDish(wKaeng, p, "", `${p.meaning} Curry`);
        if (d) generatedDishes.push(d);
      });
    }

    // 5. {Protein} Yang (Grilled X)
    if (wYang) {
      proteins.forEach(p => {
        const d = createDish(p, wYang, "Grilled", p.meaning);
        if (d) generatedDishes.push(d);
      });
    }

    // 6. {Protein} Tod (Deep-fried X)
    if (wTod) {
      proteins.forEach(p => {
        const d = createDish(p, wTod, "Deep-fried", p.meaning);
        if (d) generatedDishes.push(d);
      });
    }

    // 7. Pad {Veg} (Stir-fried Veg)
    if (wPad) {
      vegs.forEach(v => {
        const d = createDish(wPad, v, "Stir-fried", v.meaning);
        if (d) generatedDishes.push(d);
      });
    }

    // 8. Add existing dishes from words.ts
    const existingDishes = words.filter(w => w.subCategory === "dishes");
    generatedDishes.push(...existingDishes);

    return generatedDishes;
  }, []);

  const generateOptions = (correctWord: Word, allItems: Word[]) => {
    // Pick 3 random wrong answers from the generated list
    const otherWords = allItems.filter(w => w.thai !== correctWord.thai);
    const uniqueOtherWords = Array.from(
      new Map(otherWords.map(w => [w.meaning, w])).values()
    );
    
    const wrongWords = uniqueOtherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [
      { 
        value: correctWord.meaning, 
        label: correctWord.meaning,
        subLabel: correctWord.phonetic
      },
      ...wrongWords.map(w => ({
        value: w.meaning,
        label: w.meaning,
        subLabel: w.phonetic
      }))
    ];
    
    return options.sort(() => Math.random() - 0.5);
  };

  const groupConfigs: LetterQuizProps<Word>["groupConfigs"] = {
    all: {
      type: "all",
      label: "All Dishes",
      getGroupKeys: () => new Set(["all-all"]),
      getGroupedItems: () => ({ all: dishes }),
      getGroupOrder: () => ["all"],
      getGroupLabel: () => "Mixed Dishes",
    }
  };

  return (
    <LetterQuiz<Word>
      quizType={QUIZ_TYPE}
      allItems={dishes}
      getCorrectAnswer={(w) => w.meaning}
      generateOptions={generateOptions}
      renderCard={(w, showSound, showBadge) => (
        <DishCard word={w} showSound={showSound} showBadge={showBadge} />
      )}
      getItemColor={() => "var(--chart-3)"} // Food color
      getItemLabel={() => "Dish"}
      getItemSubLabel={(w) => w.phonetic}
      tabTypes={["all"]}
      groupConfigs={groupConfigs}
      title="Dish Builder Quiz"
      itemLabel="dishes"
    />
  );
};

