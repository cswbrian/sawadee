import { useMemo } from "react";
import { words, type Word, type WordCategory, categoryOrder, getCategoryLabel, type WordSubCategory, subCategoryOrder, getSubCategoryLabel } from "@/data/words";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LetterQuiz, type LetterQuizProps } from "./LetterQuiz";
import { getFamiliarityPercentage } from "@/lib/utils";

const QUIZ_TYPE = "word" as const;

const getCategoryColor = (category: WordCategory): string => {
  const colorMap: Record<WordCategory, string> = {
    greetings: "var(--chart-1)",
    basics: "var(--chart-2)",
    food: "var(--chart-3)",
    drink: "var(--chart-4)",
    places: "var(--chart-5)",
    directions: "var(--chart-1)",
    shopping: "var(--chart-2)",
  };
  return colorMap[category];
};

const getFamiliarityRangeLabel = (range: string): string => {
  if (range === "no-data") return "No Data";
  
  const rangeLabels: Record<string, string> = {
    "0-30": "Struggling (0-30%)",
    "30-50": "Struggling (30-50%)",
    "50-70": "Learning (50-70%)",
    "70-90": "Familiar (70-90%)",
    "90-100": "Mastered (90-100%)",
  };
  
  return rangeLabels[range] || `${range}%`;
};

// Simple Word Card Component
interface WordCardProps {
  word: Word;
  showSound?: boolean;
  showBadge?: boolean;
}

const WordCard = ({ word, showSound = true, showBadge = false }: WordCardProps) => {
  const bgColor = getCategoryColor(word.category);

  return (
    <Card
      className="flex flex-col items-center justify-center p-3 sm:p-4 min-h-[140px] sm:min-h-[160px] w-full"
      style={{ backgroundColor: bgColor }}
    >
      <CardContent className={`flex flex-col items-center justify-center p-0 w-full ${showSound || showBadge ? 'gap-3' : ''}`}>
        <div className="text-4xl sm:text-6xl text-foreground thai-font leading-normal text-center wrap-break-word w-full px-2">
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
            {getCategoryLabel(word.category)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export const WordsQuiz = () => {

  // Group words by category
  const groupedByCategory = useMemo(() => {
    return words.reduce(
      (acc, word) => {
        if (!acc[word.category]) {
          acc[word.category] = [];
        }
        acc[word.category].push(word);
        return acc;
      },
      {} as Record<WordCategory, Word[]>
    );
  }, []);

  // Group words by familiarity ranges
  const groupedByFamiliarity = useMemo(() => {
    const groups: Record<string, Word[]> = {
      "0-30": [],
      "30-50": [],
      "50-70": [],
      "70-90": [],
      "90-100": [],
      "no-data": [],
    };
    
    words.forEach((word) => {
      const percentage = getFamiliarityPercentage(QUIZ_TYPE, word.thai);
      
      if (percentage === null) {
        groups["no-data"].push(word);
      } else if (percentage < 30) {
        groups["0-30"].push(word);
      } else if (percentage < 50) {
        groups["30-50"].push(word);
      } else if (percentage < 70) {
        groups["50-70"].push(word);
      } else if (percentage < 90) {
        groups["70-90"].push(word);
      } else {
        groups["90-100"].push(word);
      }
    });
    
    return groups;
  }, []);

  const familiarityOrder = ["0-30", "30-50", "50-70", "70-90", "90-100", "no-data"];

  const filteredFamiliarityOrder = useMemo(() => {
    return familiarityOrder.filter((range) => {
      return groupedByFamiliarity[range] && groupedByFamiliarity[range].length > 0;
    });
  }, [groupedByFamiliarity]);

  // Group words by subCategory
  const groupedBySubCategory = useMemo(() => {
    return words.reduce(
      (acc, word) => {
        // Only include words that have a subCategory (mostly Food)
        // or group others into "general" if we want them to show up
        if (word.subCategory) {
          if (!acc[word.subCategory]) {
            acc[word.subCategory] = [];
          }
          acc[word.subCategory].push(word);
        }
        return acc;
      },
      {} as Record<string, Word[]>
    );
  }, []);

  const filteredSubCategoryOrder = useMemo(() => {
    return subCategoryOrder.filter((sub) => {
      return groupedBySubCategory[sub] && groupedBySubCategory[sub].length > 0;
    });
  }, [groupedBySubCategory]);

  // Generate options for a word (meanings)
  const generateOptions = (correctWord: Word, allWords: Word[]) => {
    const correctMeaning = correctWord.meaning;
    
    // Get unique other words for wrong options
    const otherWords = allWords.filter(w => w.meaning !== correctMeaning);
    const uniqueOtherWords = Array.from(
      new Map(otherWords.map(w => [w.meaning, w])).values()
    );
    
    const wrongWords = uniqueOtherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3); // 3 wrong options
    
    // Create options with both meaning and phonetic
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

  // Group configurations
  const groupConfigs = useMemo((): LetterQuizProps<Word>["groupConfigs"] => {
    const categoryGroupKeys = new Set<string>();
    categoryOrder.forEach((category) => {
      categoryGroupKeys.add(`category-${category}`);
    });

    const familiarityGroupKeys = new Set<string>();
    filteredFamiliarityOrder.forEach((range) => {
      familiarityGroupKeys.add(`familiarity-${range}`);
    });

    const subCategoryGroupKeys = new Set<string>();
    filteredSubCategoryOrder.forEach((sub) => {
      subCategoryGroupKeys.add(`subCategory-${sub}`);
    });

    return {
      category: {
        type: "category",
        label: "Category",
        getGroupKeys: () => categoryGroupKeys,
        getGroupedItems: () => groupedByCategory,
        getGroupOrder: () => categoryOrder,
        getGroupLabel: (value) => getCategoryLabel(value as WordCategory),
        renderGroupBadge: (value) => (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: getCategoryColor(value as WordCategory),
              color: "var(--foreground)",
            }}
          >
            {getCategoryLabel(value as WordCategory)}
          </Badge>
        ),
      },
      familiarity: {
        type: "familiarity",
        label: "Familiarity",
        getGroupKeys: () => familiarityGroupKeys,
        getGroupedItems: () => groupedByFamiliarity,
        getGroupOrder: () => filteredFamiliarityOrder,
        getGroupLabel: (value) => getFamiliarityRangeLabel(value as string),
      },
      subCategory: {
        type: "subCategory",
        label: "Food Types",
        getGroupKeys: () => subCategoryGroupKeys,
        getGroupedItems: () => groupedBySubCategory,
        getGroupOrder: () => filteredSubCategoryOrder,
        getGroupLabel: (value) => getSubCategoryLabel(value as WordSubCategory),
      },
    };
  }, [groupedByCategory, groupedByFamiliarity, filteredFamiliarityOrder, groupedBySubCategory, filteredSubCategoryOrder]);

  // Configure subcategories for categories that have them
  const subCategoryConfigs = useMemo(() => {
    // Filter subcategories by parent category
    const foodSubCategories = Object.keys(groupedBySubCategory).reduce((acc, key) => {
      const wordsInSub = groupedBySubCategory[key];
      if (wordsInSub.some(w => w.category === "food")) {
        acc[key] = wordsInSub.filter(w => w.category === "food");
      }
      return acc;
    }, {} as Record<string, Word[]>);

    const placesSubCategories = Object.keys(groupedBySubCategory).reduce((acc, key) => {
      const wordsInSub = groupedBySubCategory[key];
      if (wordsInSub.some(w => w.category === "places")) {
        acc[key] = wordsInSub.filter(w => w.category === "places");
      }
      return acc;
    }, {} as Record<string, Word[]>);

    const drinkSubCategories = Object.keys(groupedBySubCategory).reduce((acc, key) => {
      const wordsInSub = groupedBySubCategory[key];
      if (wordsInSub.some(w => w.category === "drink")) {
        acc[key] = wordsInSub.filter(w => w.category === "drink");
      }
      return acc;
    }, {} as Record<string, Word[]>);

    const foodSubCategoryOrder = filteredSubCategoryOrder.filter(sub => 
      foodSubCategories[sub] && foodSubCategories[sub].length > 0
    );
    const placesSubCategoryOrder = filteredSubCategoryOrder.filter(sub => 
      placesSubCategories[sub] && placesSubCategories[sub].length > 0
    );
    const drinkSubCategoryOrder = filteredSubCategoryOrder.filter(sub => 
      drinkSubCategories[sub] && drinkSubCategories[sub].length > 0
    );

    return {
      food: {
        subCategories: foodSubCategories,
        subCategoryOrder: foodSubCategoryOrder,
        subCategoryGroupConfig: groupConfigs.subCategory,
      },
      places: {
        subCategories: placesSubCategories,
        subCategoryOrder: placesSubCategoryOrder,
        subCategoryGroupConfig: groupConfigs.subCategory,
      },
      drink: {
        subCategories: drinkSubCategories,
        subCategoryOrder: drinkSubCategoryOrder,
        subCategoryGroupConfig: groupConfigs.subCategory,
      },
    };
  }, [groupedBySubCategory, filteredSubCategoryOrder, groupConfigs.subCategory]);

  return (
    <LetterQuiz<Word>
      quizType={QUIZ_TYPE}
      allItems={words}
      getCorrectAnswer={(w) => w.meaning}
      generateOptions={generateOptions}
      renderCard={(w, showSound, showBadge) => (
        <WordCard word={w} showSound={showSound} showBadge={showBadge} />
      )}
      getItemColor={(w) => getCategoryColor(w.category)}
      getItemLabel={(w) => getCategoryLabel(w.category)}
      getItemSubLabel={(w) => w.phonetic} // Show phonetic as sub-label in results
      tabTypes={["category", "familiarity"]}
      groupConfigs={groupConfigs}
      title="Word Quiz - Select Group"
      itemLabel="words"
      subCategoryConfigs={subCategoryConfigs}
    />
  );
};

