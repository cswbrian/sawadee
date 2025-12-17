import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
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
import { sortByFamiliarity, getFamiliarityPercentage, calculateWordTones, formatPhoneticWithTones, breakDownThaiWord } from "@/lib/utils";
import { consonants } from "@/data/consonants";
import { vowels, specialVowels } from "@/data/vowels";
import { Link } from "react-router-dom";

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
  const [showDots, setShowDots] = useState(false);

  return (
    <Card
      className="w-full py-0 bg-white transition-colors hover:bg-secondary-background relative"
      style={{ borderLeftColor: bgColor, borderLeftWidth: "3px" }}
    >
      <CardContent className="p-2.5 sm:p-3">
        {word.phonetic && (
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setShowDots(!showDots)}
            className="absolute top-2 right-2 h-7 w-7 p-0 z-10"
            title={showDots ? "Hide dots" : "Show dots"}
          >
            {showDots ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-3xl text-foreground thai-font leading-tight mb-1">
              {showDots && word.phonetic
                ? breakDownThaiWord(word.thai, word.phonetic)
                : word.thai}
            </div>
            <div className="text-md text-muted-foreground font-medium mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(() => {
                  const allVowels = [...vowels, ...specialVowels];
                  const syllableTones = calculateWordTones(
                    word.thai,
                    word.phonetic,
                    consonants,
                    allVowels,
                    word.tone
                  );
                  const formatted = formatPhoneticWithTones(word.phonetic, syllableTones);
                  
                  return formatted.map((item, idx) => (
                    <span key={idx} className="inline-flex flex-col items-center leading-tight">
                      <span className="leading-tight">{item.syllable}</span>
                      <span className="text-xs font-medium opacity-90 leading-tight">({item.tone})</span>
                    </span>
                  ));
                })()}
              </div>
            </div>
            <div className="text-sm sm:text-base text-foreground">
              {word.meaning}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Words = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") as WordCategory | null;
  const defaultTab = searchParams.get("tab") || "category";
  
  // State for selected subcategories
  const [selectedSubCategories, setSelectedSubCategories] = useState<Set<WordSubCategory>>(new Set());

  // Get subcategories for the filtered category
  const availableSubCategories = useMemo(() => {
    if (!categoryFilter) return [];
    const subCategories = new Set<WordSubCategory>();
    words.forEach(word => {
      if (word.category === categoryFilter && word.subCategory) {
        subCategories.add(word.subCategory);
      }
    });
    return Array.from(subCategories).sort((a, b) => {
      const aLabel = getSubCategoryLabel(a);
      const bLabel = getSubCategoryLabel(b);
      return aLabel.localeCompare(bLabel);
    });
  }, [categoryFilter]);

  // Filter words by category and selected subcategories
  const filteredWords = useMemo(() => {
    let result = words;
    
    // Filter by category if specified
    if (categoryFilter) {
      result = result.filter(w => w.category === categoryFilter);
    }
    
    // Filter by selected subcategories if any are selected
    if (selectedSubCategories.size > 0) {
      result = result.filter(w => 
        w.subCategory && selectedSubCategories.has(w.subCategory)
      );
    }
    
    return result;
  }, [categoryFilter, selectedSubCategories]);

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

  // Toggle subcategory selection
  const toggleSubCategory = (subCategory: WordSubCategory) => {
    setSelectedSubCategories(prev => {
      const next = new Set(prev);
      if (next.has(subCategory)) {
        next.delete(subCategory);
      } else {
        next.add(subCategory);
      }
      return next;
    });
  };

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

        {/* Subcategory Filter Buttons */}
        {categoryFilter && availableSubCategories.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 text-sm font-semibold text-muted-foreground">
              Filter by Subcategory:
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSubCategories.map((subCategory) => {
                const isSelected = selectedSubCategories.has(subCategory);
                return (
                  <Button
                    key={subCategory}
                    variant={isSelected ? "default" : "neutral"}
                    size="sm"
                    onClick={() => toggleSubCategory(subCategory)}
                    className="text-xs"
                    style={isSelected ? {
                      backgroundColor: getCategoryColor(categoryFilter),
                      color: "var(--foreground)",
                    } : undefined}
                  >
                    {getSubCategoryLabel(subCategory)}
                  </Button>
                );
              })}
              {selectedSubCategories.size > 0 && (
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => setSelectedSubCategories(new Set())}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="category" className="flex-1">
              Category
            </TabsTrigger>
            <TabsTrigger value="familiarity" className="flex-1">
              Familiarity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category" asChild>
            <div>
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
            </div>
          </TabsContent>

          <TabsContent value="familiarity" asChild>
            <div>
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
            </div>
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

