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

type GroupKey = {
  type: "class" | "popularity";
  value: ConsonantClass | number;
};

const groupKeyToString = (group: GroupKey): string => {
  return `${group.type}-${group.value}`;
};

const stringToGroupKey = (str: string): GroupKey => {
  const [type, valueStr] = str.split("-");
  const value = type === "class" ? (valueStr as ConsonantClass) : Number(valueStr);
  return { type: type as "class" | "popularity", value };
};

export const ReadingQuiz = () => {
  // Initialize with all class groups selected by default
  const getAllClassGroupKeys = useMemo(() => {
    const keys = new Set<string>();
    (["high", "mid", "low"] as ConsonantClass[]).forEach((classType) => {
      keys.add(groupKeyToString({ type: "class", value: classType }));
    });
    return keys;
  }, []);

  // Initialize with all popularity groups selected by default
  const getAllPopularityGroupKeys = useMemo(() => {
    const keys = new Set<string>();
    const allPopularities = Array.from(
      new Set(
        consonants.map((c) => {
          const popularity = c.popularity ?? 999;
          return popularity === 999 ? 999 : Math.floor(popularity);
        })
      )
    ).sort((a, b) => a - b);
    allPopularities.forEach((popularity) => {
      keys.add(groupKeyToString({ type: "popularity", value: popularity }));
    });
    return keys;
  }, []);

  const { setIsInQuiz } = useQuizContext();
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [selectedClassGroups, setSelectedClassGroups] = useState<Set<string>>(getAllClassGroupKeys);
  const [selectedPopularityGroups, setSelectedPopularityGroups] = useState<Set<string>>(getAllPopularityGroupKeys);
  const [activeTab, setActiveTab] = useState<"class" | "popularity">("class");
  const [quizTab, setQuizTab] = useState<"class" | "popularity">("class");
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

  const handleGroupToggle = (type: "class" | "popularity", value: ConsonantClass | number) => {
    const groupKey = groupKeyToString({ type, value });
    if (type === "class") {
      setSelectedClassGroups((prev) => {
        const next = new Set(prev);
        if (next.has(groupKey)) {
          next.delete(groupKey);
        } else {
          next.add(groupKey);
        }
        return next;
      });
    } else {
      setSelectedPopularityGroups((prev) => {
        const next = new Set(prev);
        if (next.has(groupKey)) {
          next.delete(groupKey);
        } else {
          next.add(groupKey);
        }
        return next;
      });
    }
  };

  const handleClearAll = () => {
    if (activeTab === "class") {
      setSelectedClassGroups(new Set());
    } else {
      setSelectedPopularityGroups(new Set());
    }
  };

  const handleStartQuiz = () => {
    // Use selected groups from the active tab
    const selectedGroups = activeTab === "class" ? selectedClassGroups : selectedPopularityGroups;
    if (selectedGroups.size === 0) return;

    // Combine consonants from all selected groups in the active tab
    const allConsonants: Consonant[] = [];
    selectedGroups.forEach((groupKeyStr) => {
      const group = stringToGroupKey(groupKeyStr);
      const groupConsonants =
        group.type === "class"
          ? groupedByClass[group.value as ConsonantClass] || []
          : groupedByPopularity[group.value as number] || [];
      allConsonants.push(...groupConsonants);
    });

    // Remove duplicates (in case a consonant appears in multiple groups)
    const uniqueConsonants = Array.from(
      new Map(allConsonants.map((c) => [c.thai, c])).values()
    );

    // Check if adaptive learning is enabled
    const settings = loadSettings();
    let shuffled: Consonant[];
    
    if (settings.adaptiveLearning) {
      // Use weighted selection based on user performance
      shuffled = selectWeighted(QUIZ_TYPE, uniqueConsonants, 10);
      // Shuffle the final selection
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    } else {
      // Regular random selection
      shuffled = [...uniqueConsonants]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    }

    setQuizTab(activeTab);
    setShuffledConsonants(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    if (shuffled.length > 0) {
      generateOptionsForQuestion(shuffled[0]);
    }
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
    // Use selected groups from the tab that was used to start the quiz
    const selectedGroups = quizTab === "class" ? selectedClassGroups : selectedPopularityGroups;
    if (selectedGroups.size === 0) return;

    // Combine consonants from all selected groups in the active tab
    const allConsonants: Consonant[] = [];
    selectedGroups.forEach((groupKeyStr) => {
      const group = stringToGroupKey(groupKeyStr);
      const groupConsonants =
        group.type === "class"
          ? groupedByClass[group.value as ConsonantClass] || []
          : groupedByPopularity[group.value as number] || [];
      allConsonants.push(...groupConsonants);
    });

    // Remove duplicates
    const uniqueConsonants = Array.from(
      new Map(allConsonants.map((c) => [c.thai, c])).values()
    );

    // Check if adaptive learning is enabled
    const settings = loadSettings();
    let shuffled: Consonant[];
    
    if (settings.adaptiveLearning) {
      // Use weighted selection based on user performance
      shuffled = selectWeighted(QUIZ_TYPE, uniqueConsonants, 10);
      // Shuffle the final selection
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    } else {
      // Regular random selection
      shuffled = [...uniqueConsonants]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    }
    
    setShuffledConsonants(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    if (shuffled.length > 0) {
      generateOptionsForQuestion(shuffled[0]);
    }
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
            onValueChange={(value) => setActiveTab(value as "class" | "popularity")}
            className="w-full"
          >
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="class" className="flex-1">
                Class
              </TabsTrigger>
              <TabsTrigger value="popularity" className="flex-1">
                Popularity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="class" asChild>
              <div className="space-y-4">
                {(["high", "mid", "low"] as ConsonantClass[]).map((classType) => {
                  const groupKey = groupKeyToString({ type: "class", value: classType });
                  const isSelected = selectedClassGroups.has(groupKey);
                  return (
                    <Card
                      key={classType}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? "bg-secondary-background" : ""
                      }`}
                      onClick={() => handleGroupToggle("class", classType)}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleGroupToggle("class", classType)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: getClassColor(classType),
                                color: "var(--foreground)",
                              }}
                            >
                              {getClassLabel(classType)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {groupedByClass[classType]?.length || 0} consonants
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="popularity" asChild>
              <div className="space-y-4">
                {sortedPopularities.map((popularity) => {
                  const groupKey = groupKeyToString({ type: "popularity", value: popularity });
                  const isSelected = selectedPopularityGroups.has(groupKey);
                  return (
                    <Card
                      key={popularity}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? "bg-secondary-background" : ""
                      }`}
                      onClick={() => handleGroupToggle("popularity", popularity)}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleGroupToggle("popularity", popularity)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="font-semibold">
                              Popularity {popularity === 999 ? "Unknown" : popularity}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {groupedByPopularity[popularity]?.length || 0} consonants
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={handleStartQuiz}
              disabled={
                (activeTab === "class" ? selectedClassGroups : selectedPopularityGroups).size === 0
              }
              className="w-full max-w-md"
            >
              Start Quiz
            </Button>
            {(() => {
              const selectedGroups = activeTab === "class" ? selectedClassGroups : selectedPopularityGroups;
              return selectedGroups.size > 0 ? (
                <Button variant="neutral" size="lg" onClick={handleClearAll} className="w-full max-w-md">
                  Clear All
                </Button>
              ) : null;
            })()}
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
    const wrongAnswers = answerResults.filter((r) => !r.isCorrect);

    // Get selected groups labels for display
    const selectedGroups = quizTab === "class" ? selectedClassGroups : selectedPopularityGroups;
    const selectedGroupLabels = Array.from(selectedGroups).map((groupKeyStr) => {
      const group = stringToGroupKey(groupKeyStr);
      if (group.type === "class") {
        return getClassLabel(group.value as ConsonantClass);
      } else {
        return `Popularity ${group.value === 999 ? "Unknown" : group.value}`;
      }
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

                {wrongAnswers.length > 0 && (
                  <div className="w-full space-y-4">
                    <h3 className="text-lg font-semibold">Wrong Answers:</h3>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {wrongAnswers.map((result, index) => (
                        <ConsonantCard
                          key={index}
                          consonant={result.consonant}
                          showSound={true}
                          showBadge={true}
                        />
                      ))}
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

