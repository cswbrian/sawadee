import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuizContext } from "@/App";
import { loadSettings } from "@/lib/settings";
import { recordAnswer, selectWeighted, type QuizType } from "@/lib/stats";
import { sortByFamiliarity, getFamiliarityPercentage } from "@/lib/utils";

type QuizState = "selection" | "quiz" | "end";

type GroupKey = {
  type: string;
  value: string | number;
};

type GroupConfig<T extends { thai: string }> = {
  type: string;
  label: string;
  getGroupKeys: () => Set<string>;
  getGroupedItems: () => Record<string, T[]>;
  getGroupOrder: () => string[];
  getGroupLabel: (value: string | number) => string;
  renderGroupBadge?: (value: string | number) => React.ReactNode;
};

const groupKeyToString = (group: GroupKey): string => {
  return `${group.type}-${group.value}`;
};

const stringToGroupKey = (str: string): GroupKey => {
  const parts = str.split("-");
  const type = parts[0];
  
  // Check if value is a number
  const valueStr = parts.slice(1).join("-");
  const numValue = Number(valueStr);
  const value = isNaN(numValue) ? valueStr : numValue;
  
  return { type, value };
};

// Reusable Group Card Component
type GroupCardProps = {
  groupKey: string;
  groupValue: string | number;
  groupType: string;
  isSelected: boolean;
  count: number;
  label: string;
  itemLabel: string;
  onToggle: () => void;
  renderBadge?: () => React.ReactNode;
};

const GroupCard = ({
  groupKey,
  isSelected,
  count,
  label,
  itemLabel,
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
              {count} {itemLabel}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export type LetterQuizProps<T extends { thai: string }> = {
  quizType: QuizType;
  allItems: T[];
  getCorrectAnswer: (item: T) => string;
  generateOptions: (item: T, allItems: T[]) => string[];
  renderCard: (item: T, showSound?: boolean, showBadge?: boolean) => React.ReactNode;
  getItemColor?: (item: T) => string;
  getItemLabel?: (item: T) => string;
  getItemSubLabel?: (item: T) => string | undefined; // Optional subtitle (e.g., thaiName for consonants)
  // Grouping configuration
  tabTypes: string[];
  groupConfigs: Record<string, GroupConfig<T>>;
  // Display
  title: string;
  itemLabel: string; // e.g., "consonants", "vowels"
};

export function LetterQuiz<T extends { thai: string }>({
  quizType,
  allItems,
  getCorrectAnswer,
  generateOptions: generateOptionsProp,
  renderCard,
  getItemColor,
  getItemLabel,
  getItemSubLabel,
  tabTypes,
  groupConfigs,
  title,
  itemLabel,
}: LetterQuizProps<T>) {
  const { setIsInQuiz } = useQuizContext();
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [activeTab, setActiveTab] = useState<string>(tabTypes[0]);
  const [quizTab, setQuizTab] = useState<string>(tabTypes[0]);
  const [quizSelectedGroups, setQuizSelectedGroups] = useState<Set<string> | null>(null);
  const [shuffledItems, setShuffledItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answerResults, setAnswerResults] = useState<Array<{
    item: T;
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

  // Initialize selected groups with all groups selected by default
  const [selectedGroups, setSelectedGroups] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    tabTypes.forEach((tabType) => {
      initial[tabType] = new Set();
    });
    return initial;
  });

  // Populate selected groups with defaults on mount
  useEffect(() => {
    const newSelectedGroups: Record<string, Set<string>> = {};
    tabTypes.forEach((tabType) => {
      const config = groupConfigs[tabType];
      if (config) {
        newSelectedGroups[tabType] = new Set(config.getGroupKeys());
      } else {
        newSelectedGroups[tabType] = new Set();
      }
    });
    setSelectedGroups(newSelectedGroups);
  }, [tabTypes, groupConfigs]);

  // Sort wrong answers by familiarity (least correct first)
  const wrongAnswers = answerResults.filter((r) => !r.isCorrect);
  const sortedWrongAnswers = useMemo(() => {
    if (wrongAnswers.length === 0) return [];
    const wrongItems = wrongAnswers.map((r) => r.item);
    const sorted = sortByFamiliarity(wrongItems, quizType);
    return sorted.map((item) => {
      const result = wrongAnswers.find((r) => r.item.thai === item.thai);
      return result!;
    });
  }, [wrongAnswers, quizType]);

  const generateOptionsForQuestion = (correctItem: T) => {
    const options = generateOptionsProp(correctItem, allItems);
    setOptions(options);
  };

  // Unified group toggle handler
  const handleGroupToggle = (type: string, value: string | number) => {
    const groupKey = groupKeyToString({ type, value });
    setSelectedGroups((prev) => {
      const next = { ...prev };
      const currentSet = new Set(next[type] || []);
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
  const getSelectedGroupsForTab = (tab: string): Set<string> => {
    return selectedGroups[tab] || new Set();
  };

  // Get items from selected groups
  const getItemsFromSelectedGroups = (tab: string, selectedGroupKeysOverride?: Set<string>): T[] => {
    // Use override if provided (for restart), otherwise use current selected groups
    const selectedGroupKeys = selectedGroupKeysOverride ?? getSelectedGroupsForTab(tab);
    const allItems: T[] = [];
    
    // Use the tab's config, not the group.type from the parsed key
    const config = groupConfigs[tab];
    if (!config) return [];
    
    const groupedItems = config.getGroupedItems();
    
    selectedGroupKeys.forEach((groupKeyStr) => {
      const group = stringToGroupKey(groupKeyStr);
      // Verify that the group type matches the tab (safety check)
      if (group.type !== tab) return;
      
      const groupItems = groupedItems[String(group.value)] || [];
      allItems.push(...groupItems);
    });

    // Remove duplicates
    return Array.from(
      new Map(allItems.map((item) => [item.thai, item])).values()
    );
  };

  // Prepare quiz items (shuffled selection)
  const prepareQuizItems = (tab: string, selectedGroupKeysOverride?: Set<string>): T[] => {
    const uniqueItems = getItemsFromSelectedGroups(tab, selectedGroupKeysOverride);
    if (uniqueItems.length === 0) return [];

    const settings = loadSettings();
    let shuffled: T[];
    
    if (settings.adaptiveLearning) {
      shuffled = selectWeighted(quizType, uniqueItems, 10);
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    } else {
      shuffled = [...uniqueItems]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    }
    
    return shuffled;
  };

  const handleStartQuiz = () => {
    const selectedGroupKeys = getSelectedGroupsForTab(activeTab);
    if (selectedGroupKeys.size === 0) return;

    const shuffled = prepareQuizItems(activeTab);
    if (shuffled.length === 0) return;

    // Save the tab and selected groups for restart
    setQuizTab(activeTab);
    setQuizSelectedGroups(new Set(selectedGroupKeys));
    setShuffledItems(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    generateOptionsForQuestion(shuffled[0]);
    setQuizState("quiz");
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Already selected, ignore
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    // Save current answer result
    if (selectedAnswer !== null && shuffledItems[currentIndex]) {
      const currentItem = shuffledItems[currentIndex];
      const correctAnswer = getCorrectAnswer(currentItem);
      const isCorrect = selectedAnswer === correctAnswer;
      
      // Record the answer for stats tracking
      recordAnswer(quizType, currentItem.thai, isCorrect);
      
      setAnswerResults((prev) => [
        ...prev,
        {
          item: currentItem,
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
        },
      ]);
    }

    if (currentIndex < shuffledItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      generateOptionsForQuestion(shuffledItems[nextIndex]);
    } else {
      setQuizState("end");
    }
  };

  const handleRestart = () => {
    // Use the saved selected groups from when the quiz was started
    if (!quizSelectedGroups || quizSelectedGroups.size === 0) return;
    
    const shuffled = prepareQuizItems(quizTab, quizSelectedGroups);
    if (shuffled.length === 0) return;
    
    setShuffledItems(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    generateOptionsForQuestion(shuffled[0]);
    setQuizState("quiz");
  };

  const handleReturnToSelection = () => {
    setQuizState("selection");
    // Keep selectedGroups - don't reset them
    // Clear quizSelectedGroups so next start uses current selections
    setQuizSelectedGroups(null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
  };

  const handleExitQuiz = () => {
    if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
      setQuizState("selection");
      setQuizSelectedGroups(null);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerResults([]);
    }
  };

  // Helper to get group label for display
  const getGroupDisplayLabel = (group: GroupKey): string => {
    const config = groupConfigs[group.type];
    if (!config) return String(group.value);
    return config.getGroupLabel(group.value);
  };

  if (quizState === "selection") {
    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl">{title}</h1>
          </div>

          <Tabs
            defaultValue={tabTypes[0]}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="w-full"
          >
            <TabsList className="mb-6 w-full">
              {tabTypes.map((tabType) => {
                const config = groupConfigs[tabType];
                return (
                  <TabsTrigger key={tabType} value={tabType} className="flex-1">
                    {config?.label || tabType}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabTypes.map((tabType) => {
              const config = groupConfigs[tabType];
              if (!config) return null;
              
              const groupedItems = config.getGroupedItems();
              const groupOrder = config.getGroupOrder();
              
              return (
                <TabsContent key={tabType} value={tabType} asChild>
                  <div className="space-y-4">
                    {groupOrder.map((groupValueStr) => {
                      const groupValue = groupValueStr;
                      const groupKey = groupKeyToString({ type: tabType, value: groupValue });
                      const isSelected = getSelectedGroupsForTab(tabType).has(groupKey);
                      const count = groupedItems[groupValueStr]?.length || 0;
                      
                      return (
                        <GroupCard
                          key={groupKey}
                          groupKey={groupKey}
                          groupValue={groupValue}
                          groupType={tabType}
                          isSelected={isSelected}
                          count={count}
                          label={config.getGroupLabel(groupValue)}
                          itemLabel={itemLabel}
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
    const currentItem = shuffledItems[currentIndex];
    const progress = ((currentIndex + 1) / shuffledItems.length) * 100;
    const correctAnswer = getCorrectAnswer(currentItem);

    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {currentIndex + 1} / {shuffledItems.length}
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
                  {currentItem.thai}
                </div>
                <div className="flex min-h-[80px] flex-col items-center justify-center gap-2">
                  {selectedAnswer !== null ? (
                    <>
                      <div className="text-2xl font-semibold text-foreground">
                        {correctAnswer || "-"}
                      </div>
                      {getItemSubLabel && getItemSubLabel(currentItem) && (
                        <div className="text-base text-muted-foreground">
                          {getItemSubLabel(currentItem)}
                        </div>
                      )}
                      {getItemColor && getItemLabel && (
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: getItemColor(currentItem),
                            color: "var(--foreground)",
                          }}
                        >
                          {getItemLabel(currentItem)}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="h-[52px]" />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === correctAnswer;
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
                      key={`${option}-${index}`}
                      variant="neutral"
                      size="lg"
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isDisabled}
                      className={`h-16 text-xl ${backgroundColor || ""} border-2 border-border transition-all ${
                        isDisabled ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {option || "-"}
                    </Button>
                  );
                })}
              </div>

              <div className="flex h-11 justify-center">
                {selectedAnswer !== null && (
                  <Button variant="default" size="lg" onClick={handleNext}>
                    {currentIndex < shuffledItems.length - 1 ? "Next" : "Finish"}
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
    const totalQuestions = shuffledItems.length;

    // Get selected groups labels for display - use the saved groups from when quiz started
    const selectedGroupKeys = quizSelectedGroups || new Set<string>();
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
                        const percentage = getFamiliarityPercentage(quizType, result.item.thai);
                        return (
                          <div key={index} className="flex flex-col items-center gap-1 w-full">
                            <div className="w-full">
                              {renderCard(result.item, true, true)}
                            </div>
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
}

