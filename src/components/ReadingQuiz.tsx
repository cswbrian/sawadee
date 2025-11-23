import { useState, useMemo, useEffect } from "react";
import { consonants, type Consonant, type ConsonantClass } from "@/data/consonants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuizContext } from "@/App";
import { ConsonantCard } from "./ConsonantCard";
import { loadSettings } from "@/lib/settings";
import { recordAnswer, selectWeighted } from "@/lib/stats";
import { sortByFamiliarity, getFamiliarityPercentage } from "@/lib/utils";

const QUIZ_TYPE = "initial_consonant" as const;

const getClassColor = (classType: ConsonantClass): string => {
  const colorMap: Record<ConsonantClass, string> = {
    high: "var(--chart-2)",
    mid: "var(--chart-3)",
    low: "var(--chart-4)",
  };
  return colorMap[classType];
};

const getClassLabel = (classType: ConsonantClass): string => {
  return classType.charAt(0).toUpperCase() + classType.slice(1);
};

type QuizState = "selection" | "quiz" | "end";
type TabType = "class" | "popularity" | "familiarity";

type GroupKey = {
  type: TabType;
  value: ConsonantClass | number | string;
};

type GroupConfig = {
  type: TabType;
  label: string;
  getGroupKeys: () => Set<string>;
  getGroupedConsonants: () => Record<string, Consonant[]>;
  getGroupOrder: () => string[];
  getGroupLabel: (value: ConsonantClass | number | string) => string;
  renderGroupBadge?: (value: ConsonantClass | number | string) => React.ReactNode;
};

const groupKeyToString = (group: GroupKey): string => {
  return `${group.type}-${group.value}`;
};

const stringToGroupKey = (str: string): GroupKey => {
  const parts = str.split("-");
  const type = parts[0] as TabType;
  
  if (type === "class") {
    return { type, value: parts[1] as ConsonantClass };
  } else if (type === "popularity") {
    return { type, value: Number(parts[1]) };
  } else {
    // For familiarity, the value might contain dashes (e.g., "0-30")
    // So we need to join everything after the first part
    return { type, value: parts.slice(1).join("-") };
  }
};

// Helper to get consonants from a group key
const getConsonantsFromGroup = (
  group: GroupKey,
  groupedByClass: Record<ConsonantClass, Consonant[]>,
  groupedByPopularity: Record<number, Consonant[]>,
  groupedByFamiliarity: Record<string, Consonant[]>
): Consonant[] => {
  if (group.type === "class") {
    return groupedByClass[group.value as ConsonantClass] || [];
  } else if (group.type === "popularity") {
    return groupedByPopularity[group.value as number] || [];
  } else {
    return groupedByFamiliarity[group.value as string] || [];
  }
};

// Helper to get group label for display
const getGroupDisplayLabel = (group: GroupKey): string => {
  if (group.type === "class") {
    return getClassLabel(group.value as ConsonantClass);
  } else if (group.type === "popularity") {
    return `Popularity ${group.value === 999 ? "Unknown" : group.value}`;
  } else {
    const range = group.value as string;
    return range === "no-data" ? "No Data" : `${range}%`;
  }
};

// Reusable Group Card Component
type GroupCardProps = {
  groupKey: string;
  groupValue: ConsonantClass | number | string;
  groupType: TabType;
  isSelected: boolean;
  count: number;
  label: string;
  onToggle: () => void;
  renderBadge?: () => React.ReactNode;
};

const GroupCard = ({
  groupKey,
  isSelected,
  count,
  label,
  onToggle,
  renderBadge,
}: GroupCardProps) => {
  return (
    <Card
      key={groupKey}
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? "bg-secondary-background" : ""
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
            />
            {renderBadge ? renderBadge() : (
              <span className="font-semibold">{label}</span>
            )}
            <span className="text-sm text-muted-foreground">
              {count} consonants
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReadingQuiz = () => {
  const { setIsInQuiz } = useQuizContext();
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [activeTab, setActiveTab] = useState<TabType>("class");
  const [quizTab, setQuizTab] = useState<TabType>("class");
  const [shuffledConsonants, setShuffledConsonants] = useState<Consonant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answerResults, setAnswerResults] = useState<Array<{
    consonant: Consonant;
    selectedAnswer: string;
    isCorrect: boolean;
  }>>([]);

  // Update navigation visibility based on quiz state
  useEffect(() => {
    setIsInQuiz(quizState === "quiz");
    return () => {
      setIsInQuiz(false);
    };
  }, [quizState, setIsInQuiz]);

  // Warn user before leaving/refreshing during quiz
  useEffect(() => {
    if (quizState === "quiz") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
        return ""; // Required for some browsers
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [quizState]);

  // Group consonants by class
  const groupedByClass = useMemo(() => {
    return consonants.reduce(
      (acc, consonant) => {
        if (!acc[consonant.class]) {
          acc[consonant.class] = [];
        }
        acc[consonant.class].push(consonant);
        return acc;
      },
      {} as Record<ConsonantClass, Consonant[]>
    );
  }, []);

  // Group consonants by popularity ranges (1.1-1.6 → 1, 2.1-2.9 → 2, etc.)
  const groupedByPopularity = useMemo(() => {
    return consonants.reduce(
      (acc, consonant) => {
        const popularity = consonant.popularity ?? 999;
        // Group by integer part (floor)
        const popularityGroup = popularity === 999 ? 999 : Math.floor(popularity);
        if (!acc[popularityGroup]) {
          acc[popularityGroup] = [];
        }
        acc[popularityGroup].push(consonant);
        return acc;
      },
      {} as Record<number, Consonant[]>
    );
  }, []);

  const sortedPopularities = useMemo(() => {
    return Object.keys(groupedByPopularity)
      .map(Number)
      .sort((a, b) => a - b);
  }, [groupedByPopularity]);

  // Group consonants by familiarity ranges
  const groupedByFamiliarity = useMemo(() => {
    const groups: Record<string, Consonant[]> = {
      "0-30": [],
      "30-50": [],
      "50-70": [],
      "70-90": [],
      "90-100": [],
      "no-data": [],
    };
    
    consonants.forEach((consonant) => {
      const percentage = getFamiliarityPercentage(QUIZ_TYPE, consonant.thai);
      
      if (percentage === null) {
        groups["no-data"].push(consonant);
      } else if (percentage < 30) {
        groups["0-30"].push(consonant);
      } else if (percentage < 50) {
        groups["30-50"].push(consonant);
      } else if (percentage < 70) {
        groups["50-70"].push(consonant);
      } else if (percentage < 90) {
        groups["70-90"].push(consonant);
      } else {
        groups["90-100"].push(consonant);
      }
    });
    
    return groups;
  }, []);

  const familiarityOrder = ["0-30", "30-50", "50-70", "70-90", "90-100", "no-data"];

  // Initialize default group keys (computed once)
  const defaultGroupKeys = useMemo(() => {
    const classGroupKeys = new Set<string>();
    (["high", "mid", "low"] as ConsonantClass[]).forEach((classType) => {
      classGroupKeys.add(groupKeyToString({ type: "class", value: classType }));
    });

    const popularityGroupKeys = new Set<string>();
    const allPopularities = Array.from(
      new Set(
        consonants.map((c) => {
          const popularity = c.popularity ?? 999;
          return popularity === 999 ? 999 : Math.floor(popularity);
        })
      )
    ).sort((a, b) => a - b);
    allPopularities.forEach((popularity) => {
      popularityGroupKeys.add(groupKeyToString({ type: "popularity", value: popularity }));
    });

    const familiarityGroupKeys = new Set<string>();
    familiarityOrder.forEach((range) => {
      familiarityGroupKeys.add(groupKeyToString({ type: "familiarity", value: range }));
    });

    return {
      class: classGroupKeys,
      popularity: popularityGroupKeys,
      familiarity: familiarityGroupKeys,
    };
  }, []);

  // Initialize group configurations
  const groupConfigs = useMemo((): Record<TabType, GroupConfig> => {
    return {
      class: {
        type: "class",
        label: "Class",
        getGroupKeys: () => defaultGroupKeys.class,
        getGroupedConsonants: () => groupedByClass,
        getGroupOrder: () => ["high", "mid", "low"],
        getGroupLabel: (value) => getClassLabel(value as ConsonantClass),
        renderGroupBadge: (value) => (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: getClassColor(value as ConsonantClass),
              color: "var(--foreground)",
            }}
          >
            {getClassLabel(value as ConsonantClass)}
          </Badge>
        ),
      },
      popularity: {
        type: "popularity",
        label: "Popularity",
        getGroupKeys: () => defaultGroupKeys.popularity,
        getGroupedConsonants: () => groupedByPopularity,
        getGroupOrder: () => sortedPopularities.map(String),
        getGroupLabel: (value) => `Popularity ${value === 999 ? "Unknown" : value}`,
      },
      familiarity: {
        type: "familiarity",
        label: "Familiarity",
        getGroupKeys: () => defaultGroupKeys.familiarity,
        getGroupedConsonants: () => groupedByFamiliarity,
        getGroupOrder: () => familiarityOrder,
        getGroupLabel: (value) => {
          const range = value as string;
          return range === "no-data" ? "No Data" : `${range}%`;
        },
      },
    };
  }, [groupedByClass, groupedByPopularity, groupedByFamiliarity, sortedPopularities, defaultGroupKeys]);

  // Initialize selected groups with all groups selected by default
  const [selectedGroups, setSelectedGroups] = useState<Record<TabType, Set<string>>>({
    class: new Set(),
    popularity: new Set(),
    familiarity: new Set(),
  });

  // Populate selected groups with defaults on mount
  useEffect(() => {
    setSelectedGroups({
      class: new Set(defaultGroupKeys.class),
      popularity: new Set(defaultGroupKeys.popularity),
      familiarity: new Set(defaultGroupKeys.familiarity),
    });
  }, [defaultGroupKeys]);

  // Sort wrong answers by familiarity (least correct first)
  // This must be at the top level to follow Rules of Hooks
  const wrongAnswers = answerResults.filter((r) => !r.isCorrect);
  const sortedWrongAnswers = useMemo(() => {
    if (wrongAnswers.length === 0) return [];
    const wrongConsonants = wrongAnswers.map((r) => r.consonant);
    const sorted = sortByFamiliarity(wrongConsonants, QUIZ_TYPE);
    return sorted.map((consonant) => {
      const result = wrongAnswers.find((r) => r.consonant.thai === consonant.thai);
      return result!;
    });
  }, [wrongAnswers]);

  const generateOptionsForQuestion = (correctConsonant: Consonant) => {
    const correctSound = correctConsonant.consonantSound || "";
    
    // Get all unique consonant sounds from all consonants
    const allSounds = Array.from(
      new Set(consonants.map((c) => c.consonantSound || ""))
    );
    
    // Remove the correct answer from the pool
    const otherSounds = allSounds.filter((sound) => sound !== correctSound);
    
    // Randomly select 5 wrong answers
    const wrongSounds = [...otherSounds]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    // Combine correct and wrong answers, then shuffle
    const allOptions = [correctSound, ...wrongSounds].sort(
      () => Math.random() - 0.5
    );
    
    setOptions(allOptions);
  };

  // Unified group toggle handler
  const handleGroupToggle = (type: TabType, value: ConsonantClass | number | string) => {
    const groupKey = groupKeyToString({ type, value });
    setSelectedGroups((prev) => {
      const next = { ...prev };
      const currentSet = new Set(next[type]);
      if (currentSet.has(groupKey)) {
        currentSet.delete(groupKey);
      } else {
        currentSet.add(groupKey);
      }
      next[type] = currentSet;
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedGroups((prev) => ({
      ...prev,
      [activeTab]: new Set<string>(),
    }));
  };

  // Get selected groups for a specific tab
  const getSelectedGroupsForTab = (tab: TabType): Set<string> => {
    return selectedGroups[tab];
  };

  // Get consonants from selected groups
  const getConsonantsFromSelectedGroups = (tab: TabType): Consonant[] => {
    const selectedGroupKeys = getSelectedGroupsForTab(tab);
    const allConsonants: Consonant[] = [];
    
    selectedGroupKeys.forEach((groupKeyStr) => {
      const group = stringToGroupKey(groupKeyStr);
      const groupConsonants = getConsonantsFromGroup(
        group,
        groupedByClass,
        groupedByPopularity,
        groupedByFamiliarity
      );
      allConsonants.push(...groupConsonants);
    });

    // Remove duplicates
    return Array.from(
      new Map(allConsonants.map((c) => [c.thai, c])).values()
    );
  };

  // Prepare quiz consonants (shuffled selection)
  const prepareQuizConsonants = (tab: TabType): Consonant[] => {
    const uniqueConsonants = getConsonantsFromSelectedGroups(tab);
    if (uniqueConsonants.length === 0) return [];

    const settings = loadSettings();
    let shuffled: Consonant[];
    
    if (settings.adaptiveLearning) {
      shuffled = selectWeighted(QUIZ_TYPE, uniqueConsonants, 10);
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    } else {
      shuffled = [...uniqueConsonants]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    }
    
    return shuffled;
  };

  const handleStartQuiz = () => {
    const selectedGroupKeys = getSelectedGroupsForTab(activeTab);
    if (selectedGroupKeys.size === 0) return;

    const shuffled = prepareQuizConsonants(activeTab);
    if (shuffled.length === 0) return;

    setQuizTab(activeTab);
    setShuffledConsonants(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    generateOptionsForQuestion(shuffled[0]);
    setQuizState("quiz");
  };

  const handleAnswerSelect = (sound: string) => {
    if (selectedAnswer !== null) return; // Already selected, ignore
    setSelectedAnswer(sound);
  };

  const handleNext = () => {
    // Save current answer result
    if (selectedAnswer !== null && shuffledConsonants[currentIndex]) {
      const currentConsonant = shuffledConsonants[currentIndex];
      const isCorrect = selectedAnswer === currentConsonant.consonantSound;
      
      // Record the answer for stats tracking
      recordAnswer(QUIZ_TYPE, currentConsonant.thai, isCorrect);
      
      setAnswerResults((prev) => [
        ...prev,
        {
          consonant: currentConsonant,
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
        },
      ]);
    }

    if (currentIndex < shuffledConsonants.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      generateOptionsForQuestion(shuffledConsonants[nextIndex]);
    } else {
      setQuizState("end");
    }
  };

  const handleRestart = () => {
    const shuffled = prepareQuizConsonants(quizTab);
    if (shuffled.length === 0) return;
    
    setShuffledConsonants(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    generateOptionsForQuestion(shuffled[0]);
    setQuizState("quiz");
  };

  const handleReturnToSelection = () => {
    setQuizState("selection");
    // Keep selectedGroups - don't reset them
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
  };

  const handleExitQuiz = () => {
    if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
      setQuizState("selection");
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerResults([]);
    }
  };

  if (quizState === "selection") {
    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl">Reading Quiz - Select Group</h1>
          </div>

          <Tabs
            defaultValue="class"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "class" | "popularity" | "familiarity")}
            className="w-full"
          >
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="class" className="flex-1">
                Class
              </TabsTrigger>
              <TabsTrigger value="popularity" className="flex-1">
                Popularity
              </TabsTrigger>
              <TabsTrigger value="familiarity" className="flex-1">
                Familiarity
              </TabsTrigger>
            </TabsList>

            {(Object.keys(groupConfigs) as TabType[]).map((tabType) => {
              const config = groupConfigs[tabType];
              const groupedConsonants = config.getGroupedConsonants();
              const groupOrder = config.getGroupOrder();
              
              return (
                <TabsContent key={tabType} value={tabType} asChild>
                  <div className="space-y-4">
                    {groupOrder.map((groupValueStr) => {
                      // Convert string back to proper type
                      const groupValue = tabType === "class" 
                        ? groupValueStr as ConsonantClass
                        : tabType === "popularity"
                        ? Number(groupValueStr)
                        : groupValueStr;
                      
                      const groupKey = groupKeyToString({ type: tabType, value: groupValue });
                      const isSelected = getSelectedGroupsForTab(tabType).has(groupKey);
                      const count = tabType === "class"
                        ? (groupedConsonants as Record<ConsonantClass, Consonant[]>)[groupValue as ConsonantClass]?.length || 0
                        : tabType === "popularity"
                        ? (groupedConsonants as Record<number, Consonant[]>)[groupValue as number]?.length || 0
                        : (groupedConsonants as Record<string, Consonant[]>)[groupValue as string]?.length || 0;
                      
                      return (
                        <GroupCard
                          key={groupKey}
                          groupKey={groupKey}
                          groupValue={groupValue}
                          groupType={tabType}
                          isSelected={isSelected}
                          count={count}
                          label={config.getGroupLabel(groupValue)}
                          onToggle={() => handleGroupToggle(tabType, groupValue)}
                          renderBadge={config.renderGroupBadge ? () => config.renderGroupBadge!(groupValue) : undefined}
                        />
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={handleStartQuiz}
              disabled={getSelectedGroupsForTab(activeTab).size === 0}
              className="w-full max-w-md"
            >
              Start Quiz
            </Button>
            {getSelectedGroupsForTab(activeTab).size > 0 && (
              <Button variant="neutral" size="lg" onClick={handleClearAll} className="w-full max-w-md">
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "quiz") {
    const currentConsonant = shuffledConsonants[currentIndex];
    const progress = ((currentIndex + 1) / shuffledConsonants.length) * 100;

    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {currentIndex + 1} / {shuffledConsonants.length}
              </span>
              <Button variant="neutral" size="sm" onClick={handleExitQuiz}>
                Exit
              </Button>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex flex-col items-center gap-8 py-8">
            <Card className="flex h-[280px] w-full max-w-md flex-col items-center justify-center p-8 bg-white">
              <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-0">
                <div className="text-8xl text-foreground thai-font leading-none">
                  {currentConsonant.thai}
                </div>
                <div className="flex min-h-[80px] flex-col items-center justify-center gap-2">
                  {selectedAnswer !== null ? (
                    <>
                      <div className="text-2xl font-semibold text-foreground">
                        {currentConsonant.consonantSound || "-"}
                      </div>
                      {currentConsonant.thaiName && (
                        <div className="text-base text-muted-foreground">
                          {currentConsonant.thaiName}
                        </div>
                      )}
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: getClassColor(currentConsonant.class),
                          color: "var(--foreground)",
                        }}
                      >
                        {getClassLabel(currentConsonant.class)}
                      </Badge>
                    </>
                  ) : (
                    <div className="h-[52px]" />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {options.map((sound, index) => {
                  const isSelected = selectedAnswer === sound;
                  const isCorrect = sound === currentConsonant.consonantSound;
                  const isWrong = isSelected && !isCorrect;
                  const isDisabled = selectedAnswer !== null;

                  let backgroundColor = undefined;
                  if (isDisabled) {
                    if (isCorrect) {
                      backgroundColor = "bg-green-500";
                    } else if (isWrong) {
                      backgroundColor = "bg-red-500";
                    }
                  }

                  return (
                    <Button
                      key={`${sound}-${index}`}
                      variant="neutral"
                      size="lg"
                      onClick={() => handleAnswerSelect(sound)}
                      disabled={isDisabled}
                      className={`h-16 text-xl ${backgroundColor || ""} border-2 border-border transition-all ${
                        isDisabled ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {sound || "-"}
                    </Button>
                  );
                })}
              </div>

              <div className="flex h-11 justify-center">
                {selectedAnswer !== null && (
                  <Button variant="default" size="lg" onClick={handleNext}>
                    {currentIndex < shuffledConsonants.length - 1 ? "Next" : "Finish"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "end") {
    const correctCount = answerResults.filter((r) => r.isCorrect).length;
    const totalQuestions = shuffledConsonants.length;

    // Get selected groups labels for display
    const selectedGroupKeys = getSelectedGroupsForTab(quizTab);
    const selectedGroupLabels = Array.from(selectedGroupKeys).map((groupKeyStr) => {
      const group = stringToGroupKey(groupKeyStr);
      return getGroupDisplayLabel(group);
    });

    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[60vh] flex-col items-center gap-8 py-8">
            <Card className="w-full max-w-2xl p-8">
              <CardContent className="flex flex-col items-center gap-6 p-0">
                <h2 className="text-3xl font-bold">Quiz Complete!</h2>
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {correctCount}/{totalQuestions} correct
                  </p>
                </div>

                {/* Selected Groups */}
                <div className="w-full">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    Groups: {selectedGroupLabels.join(", ")}
                  </h3>
                </div>

                {sortedWrongAnswers.length > 0 && (
                  <div className="w-full space-y-4">
                    <h3 className="text-lg font-semibold">Wrong Answers:</h3>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {sortedWrongAnswers.map((result, index) => {
                        const percentage = getFamiliarityPercentage(QUIZ_TYPE, result.consonant.thai);
                        return (
                          <div key={index} className="flex flex-col items-center gap-1">
                            <ConsonantCard
                              consonant={result.consonant}
                              showSound={true}
                              showBadge={true}
                            />
                            {percentage !== null && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round(percentage)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex w-full flex-col gap-3">
                  <Button variant="default" size="lg" onClick={handleRestart}>
                    Restart Quiz
                  </Button>
                  <Button variant="neutral" size="lg" onClick={handleReturnToSelection}>
                    Return to Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

