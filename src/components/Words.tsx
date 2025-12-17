import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";
import { 
  words, 
  type Word, 
  type WordCategory, 
  categoryOrder, 
  getCategoryLabel,
  type WordSubCategory,
  getSubCategoryLabel
} from "@/data/words";
import { sortByFamiliarity, getFamiliarityPercentage } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

const WordListItem = ({ word }: { word: Word }) => {
  const bgColor = getCategoryColor(word.category);
  // Adjust Thai font size based on word length
  const thaiLength = word.thai.length;
  const thaiSizeClass = thaiLength > 8 
    ? "text-lg sm:text-xl" 
    : thaiLength > 4 
    ? "text-xl sm:text-2xl" 
    : "text-2xl sm:text-3xl";

  return (
    <Card
      className="w-full py-0 bg-white transition-colors hover:bg-secondary-background"
      style={{ borderLeftColor: bgColor, borderLeftWidth: "3px" }}
    >
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`${thaiSizeClass} text-foreground thai-font leading-tight mb-1`}>
              {word.thai}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">
              {word.phonetic}
            </div>
            <div className="text-sm sm:text-base text-foreground">
              {word.meaning}
            </div>
          </div>
          <Badge
            className="text-xs shrink-0"
            style={{
              backgroundColor: bgColor,
              color: "var(--foreground)",
            }}
          >
            {getCategoryLabel(word.category)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export const Words = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") as WordCategory | null;
  const defaultTab = searchParams.get("tab") || "category";

  // Filter words by category if specified
  const filteredWords = useMemo(() => {
    if (categoryFilter) {
      return words.filter(w => w.category === categoryFilter);
    }
    return words;
  }, [categoryFilter]);

  // Group words by category
  const groupedByCategory = useMemo(() => {
    return filteredWords.reduce(
      (acc, word) => {
        if (!acc[word.category]) {
          acc[word.category] = [];
        }
        acc[word.category].push(word);
        return acc;
      },
      {} as Record<WordCategory, Word[]>
    );
  }, [filteredWords]);

  // Group words by subcategory
  const groupedBySubCategory = useMemo(() => {
    return filteredWords.reduce(
      (acc, word) => {
        if (word.subCategory) {
          if (!acc[word.subCategory]) {
            acc[word.subCategory] = [];
          }
          acc[word.subCategory].push(word);
        }
        return acc;
      },
      {} as Record<WordSubCategory, Word[]>
    );
  }, [filteredWords]);

  // Group words by familiarity
  const groupedByFamiliarity = useMemo(() => {
    const sorted = sortByFamiliarity(filteredWords, QUIZ_TYPE);
    
    const groups: Record<string, Word[]> = {
      "0-30": [],
      "30-50": [],
      "50-70": [],
      "70-90": [],
      "90-100": [],
      "no-data": [],
    };
    
    sorted.forEach((word) => {
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
  }, [filteredWords]);

  const familiarityOrder = ["0-30", "30-50", "50-70", "70-90", "90-100", "no-data"];

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

  // Get filtered category order (only show categories that have words)
  const filteredCategoryOrder = useMemo(() => {
    return categoryOrder.filter(cat => groupedByCategory[cat] && groupedByCategory[cat].length > 0);
  }, [groupedByCategory]);

  // Get subcategories for the filtered category
  const filteredSubCategoryOrder = useMemo(() => {
    if (!categoryFilter) return [];
    return Object.keys(groupedBySubCategory).filter(sub => {
      const wordsInSub = groupedBySubCategory[sub as WordSubCategory];
      return wordsInSub.some(w => w.category === categoryFilter);
    }) as WordSubCategory[];
  }, [categoryFilter, groupedBySubCategory]);

  const renderListItem = (word: Word) => (
    <motion.div
      key={word.thai}
      layoutId={`word-${word.thai}`}
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      <WordListItem word={word} />
    </motion.div>
  );

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 text-center text-2xl">
            {categoryFilter ? `${getCategoryLabel(categoryFilter)} Words` : "All Words"}
          </h1>
          <div className="w-10" />
        </div>

        {categoryFilter && (
          <div className="mb-4 flex items-center justify-center gap-2">
            <Link 
              to="/library/words" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← View All Categories
            </Link>
          </div>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="category" className="flex-1">
              Category
            </TabsTrigger>
            {categoryFilter && filteredSubCategoryOrder.length > 0 && (
              <TabsTrigger value="subCategory" className="flex-1">
                Subcategory
              </TabsTrigger>
            )}
            <TabsTrigger value="familiarity" className="flex-1">
              Familiarity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category" asChild>
            <motion.div layout>
              {filteredCategoryOrder.map((category) => (
                <div key={category} className="mb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {getCategoryLabel(category)}
                    </h2>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: getCategoryColor(category),
                        color: "var(--foreground)",
                      }}
                    >
                      {groupedByCategory[category]?.length || 0} words
                    </Badge>
                  </div>
                  <motion.div
                    layout
                    className="space-y-2"
                  >
                    {groupedByCategory[category]?.map((word) =>
                      renderListItem(word)
                    )}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          {categoryFilter && filteredSubCategoryOrder.length > 0 && (
            <TabsContent value="subCategory" asChild>
              <motion.div layout>
                {filteredSubCategoryOrder.map((subCategory) => {
                  const wordsInSub = groupedBySubCategory[subCategory]?.filter(w => w.category === categoryFilter) || [];
                  if (wordsInSub.length === 0) return null;
                  
                  return (
                    <div key={subCategory} className="mb-8">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                          {getSubCategoryLabel(subCategory)}
                        </h2>
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: getCategoryColor(categoryFilter),
                            color: "var(--foreground)",
                          }}
                        >
                          {wordsInSub.length} words
                        </Badge>
                      </div>
                      <motion.div
                        layout
                        className="space-y-2"
                      >
                        {wordsInSub.map((word) =>
                          renderListItem(word)
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            </TabsContent>
          )}

          <TabsContent value="familiarity" asChild>
            <motion.div layout>
              {familiarityOrder.map((range) => {
                const wordsInRange = groupedByFamiliarity[range] || [];
                if (wordsInRange.length === 0) return null;
                
                return (
                  <div key={range} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      {getFamiliarityRangeLabel(range)} ({wordsInRange.length} words)
                    </h2>
                    <motion.div
                      layout
                      className="space-y-2"
                    >
                      {wordsInRange.map((word) =>
                        renderListItem(word)
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center">
          <Link to="/quiz/words">
            <Button variant="default" size="lg">
              Practice Words Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

