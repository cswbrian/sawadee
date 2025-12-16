import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuizContext } from "@/App";
import { loadSettings, saveQuizSelection, getQuizSelection } from "@/lib/settings";
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
  isNavigable?: boolean; // If true, shows navigation indicator instead of checkbox
  isAccordion?: boolean; // If true, shows accordion chevron
  isExpanded?: boolean; // If true, accordion is expanded
  isIndeterminate?: boolean; // If true, checkbox shows indeterminate state
  onAccordionToggle?: () => void; // Separate handler for accordion expansion
};

const GroupCard = ({
  groupKey,
  isSelected,
  count,
  label,
  itemLabel,
  onToggle,
  renderBadge,
  isNavigable = false,
  isAccordion = false,
  isExpanded = false,
  isIndeterminate = false,
  onAccordionToggle,
}: GroupCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // If it's an accordion and click is not on checkbox, toggle accordion
    if (isAccordion && onAccordionToggle) {
      const target = e.target as HTMLElement;
      // Check if click was on checkbox or its container
      if (!target.closest('[data-slot="checkbox"]') && !target.closest('button')) {
        onAccordionToggle();
      }
    } else if (!isNavigable) {
      // For non-accordion cards, clicking anywhere toggles selection
      onToggle();
    }
  };

  return (
    <Card
      key={groupKey}
      className={`p-4 transition-colors ${
        isSelected ? "bg-secondary-background" : ""
      } ${isNavigable ? "hover:bg-secondary-background cursor-pointer" : isAccordion ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {isNavigable ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-muted-foreground">→</span>
              </div>
            ) : (
              <Checkbox
                checked={isIndeterminate ? "indeterminate" : isSelected}
                onCheckedChange={onToggle}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {renderBadge ? renderBadge() : (
              <span className="font-semibold">{label}</span>
            )}
            <span className="text-sm text-muted-foreground">
              {count} {itemLabel}
            </span>
            {isNavigable && (
              <span className="ml-auto text-sm text-muted-foreground">Tap to view</span>
            )}
            {isAccordion && (
              <div 
                className="ml-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAccordionToggle) {
                    onAccordionToggle();
                  }
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            )}
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
  generateOptions: (item: T, allItems: T[]) => Array<{
    value: string;
    label: string;
    subLabel?: string;
  } | string>; // Allow objects or strings for backward compatibility
  renderCard: (item: T, showSound?: boolean, showBadge?: boolean) => React.ReactNode;
  getItemColor?: (item: T) => string;
  getItemLabel?: (item: T) => string;
  getItemSubLabel?: (item: T) => string | undefined; // Optional subtitle (e.g., thaiName for consonants)
  // Grouping configuration
  tabTypes: string[];
  groupConfigs: Record<string, GroupConfig<T>>;
  // Display
  title: string | React.ReactNode;
  itemLabel: string; // e.g., "consonants", "vowels"
  // Optional: custom handler for group clicks (returns true if handled, false to use default toggle)
  onGroupClick?: (type: string, value: string | number) => boolean;
  // Generic subcategory configuration for any category
  // Maps category value to its subcategory configuration
  subCategoryConfigs?: Record<string, {
    subCategories: Record<string, T[]>;
    subCategoryOrder: string[];
    subCategoryGroupConfig: GroupConfig<T>;
  }>;
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
  onGroupClick,
  subCategoryConfigs,
}: LetterQuizProps<T>) {
  const { setIsInQuiz } = useQuizContext();
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [activeTab, setActiveTab] = useState<string>(tabTypes[0]);
  const [quizTab, setQuizTab] = useState<string>(tabTypes[0]);
  const [quizSelectedGroups, setQuizSelectedGroups] = useState<Set<string> | null>(null);
  const [shuffledItems, setShuffledItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<Array<string | { value: string; label: string; subLabel?: string }>>([]);
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

  // Initialize selected groups
  const [selectedGroups, setSelectedGroups] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    
    // Initialize empty sets for all tabs
    tabTypes.forEach((tabType) => {
      initial[tabType] = new Set();
    });
    
    return initial;
  });

  // Track expanded categories (for accordion functionality)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Populate selected groups on mount - load from settings or default to all
  useEffect(() => {
    const savedSelection = getQuizSelection(quizType);
    const newSelectedGroups: Record<string, Set<string>> = {};
    
    // First, verify valid tab types
    tabTypes.forEach((tabType) => {
      newSelectedGroups[tabType] = new Set();
    });

    if (savedSelection && savedSelection.length > 0) {
      // Restore from saved settings
      savedSelection.forEach(key => {
        const group = stringToGroupKey(key);
        // Only add if the tab type is valid for this quiz
        if (newSelectedGroups[group.type]) {
          newSelectedGroups[group.type].add(key);
        }
      });
      
      // If we loaded selections, update the active tab to the first one that has selections
      // or keep default if none match (fallback logic handled below)
    } else {
      // Default behavior: Select ALL for each tab
      tabTypes.forEach((tabType) => {
        const config = groupConfigs[tabType];
        if (config) {
          newSelectedGroups[tabType] = new Set(config.getGroupKeys());
        }
      });
    }
    
    setSelectedGroups(newSelectedGroups);
  }, [quizType, tabTypes, groupConfigs]);

  // Save selection whenever it changes (debounced slightly by nature of user interaction)
  const saveCurrentSelection = (currentGroups: Record<string, Set<string>>) => {
    const allSelectedKeys: string[] = [];
    Object.values(currentGroups).forEach(set => {
      set.forEach(key => allSelectedKeys.push(key));
    });
    saveQuizSelection(quizType, allSelectedKeys);
  };

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

  const generateOptionsForQuestion = (correctItem: T, poolItems?: T[]) => {
    // If poolItems is provided, use it. Otherwise default to allItems (backward compatibility)
    // Ideally we should always pass poolItems now.
    const optionsSource = poolItems && poolItems.length >= 4 ? poolItems : allItems;
    const options = generateOptionsProp(correctItem, optionsSource);
    setOptions(options);
  };

  // Unified group toggle handler
  const handleGroupToggle = (type: string, value: string | number) => {
    // Check if there's a custom handler
    if (onGroupClick && onGroupClick(type, value)) {
      // Custom handler handled it, don't do default toggle
      return;
    }
    
    // Default toggle behavior
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
      
      // Save changes
      saveCurrentSelection(next);
      
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedGroups((prev) => {
      const next = {
        ...prev,
        [activeTab]: new Set<string>(),
      };
      saveCurrentSelection(next);
      return next;
    });
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

  const handleStartQuiz = () => {
    const selectedGroupKeys = getSelectedGroupsForTab(activeTab);
    
    // If on category tab, also include subcategory selections (for food subcategories)
    let allSelectedKeys = new Set(selectedGroupKeys);
    if (activeTab === "category") {
      const subCategoryKeys = getSelectedGroupsForTab("subCategory");
      subCategoryKeys.forEach(key => allSelectedKeys.add(key));
    }
    
    if (allSelectedKeys.size === 0) return;

    // Get items from both category and subcategory if needed
    const categoryItems = activeTab === "category" ? getItemsFromSelectedGroups("category") : [];
    const subCategoryItems = activeTab === "category" ? getItemsFromSelectedGroups("subCategory") : [];
    const allItems = [...categoryItems, ...subCategoryItems];
    
    // Remove duplicates
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.thai, item])).values()
    );
    
    if (uniqueItems.length === 0) return;

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
    
    if (shuffled.length === 0) return;

    // Save the tab and selected groups for restart
    setQuizTab(activeTab);
    setQuizSelectedGroups(allSelectedKeys);
    setShuffledItems(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    
    // Pass the filtered pool of items to generateOptions
    generateOptionsForQuestion(shuffled[0], uniqueItems);
    
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
      
      // Use the stored shuffled items as the pool if possible, or reconstruct the pool
      // For consistency, we should ideally store the pool or re-derive it.
      // Since we don't store the full pool in state, we can re-derive it using the saved quizTab and quizSelectedGroups
      // However, handleNext doesn't have easy access to the exact pool used at start if it was complex.
      // But we know 'shuffledItems' is a subset of the pool.
      // The most robust way is to re-fetch the pool using quizTab and quizSelectedGroups
      if (quizSelectedGroups) {
         const poolItems = getItemsFromSelectedGroups(quizTab, quizSelectedGroups);
         generateOptionsForQuestion(shuffledItems[nextIndex], poolItems);
      } else {
         // Fallback if something is weird, though quizSelectedGroups should be set
         generateOptionsForQuestion(shuffledItems[nextIndex], shuffledItems);
      }
    } else {
      setQuizState("end");
    }
  };

  const handleRestart = () => {
    // Use the saved selected groups from when the quiz was started
    if (!quizSelectedGroups || quizSelectedGroups.size === 0) return;
    
    // Replicate the same logic as handleStartQuiz
    // Get items from both category and subcategory if needed
    const categoryItems = quizTab === "category" ? getItemsFromSelectedGroups("category", quizSelectedGroups) : [];
    const subCategoryItems = quizTab === "category" ? getItemsFromSelectedGroups("subCategory", quizSelectedGroups) : [];
    const allItems = [...categoryItems, ...subCategoryItems];
    
    // Remove duplicates
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.thai, item])).values()
    );
    
    if (uniqueItems.length === 0) return;

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
    
    if (shuffled.length === 0) return;
    
    setShuffledItems(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    
    // Pass the filtered pool of items to generateOptions
    generateOptionsForQuestion(shuffled[0], uniqueItems);
    
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
      <div className="bg-background h-[calc(100vh-64px)] flex flex-col">
        <div className="mx-auto max-w-4xl w-full flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-0">
            {typeof title === "string" ? (
              <h1 className="text-2xl mb-4">{title}</h1>
            ) : (
              <div className="mb-4">{title}</div>
            )}
          </div>

          <Tabs
            defaultValue={tabTypes[0]}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
            className="w-full flex-1 flex flex-col min-h-0"
          >
            <div className="px-4">
              <TabsList className="mb-4 w-full">
                {tabTypes.map((tabType) => {
                  const config = groupConfigs[tabType];
                  return (
                    <TabsTrigger key={tabType} value={tabType} className="flex-1">
                      {config?.label || tabType}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {tabTypes.map((tabType) => {
              const config = groupConfigs[tabType];
              if (!config) return null;
              
              const groupedItems = config.getGroupedItems();
              const groupOrder = config.getGroupOrder();
              
              return (
                <TabsContent key={tabType} value={tabType} className="flex-1 overflow-y-auto px-4 pb-4 min-h-0 data-[state=inactive]:hidden">
                  <div className="space-y-4">
                    {groupOrder.map((groupValueStr) => {
                      const groupValue = groupValueStr;
                      const groupKey = groupKeyToString({ type: tabType, value: groupValue });
                      const isSelected = getSelectedGroupsForTab(tabType).has(groupKey);
                      const count = groupedItems[groupValueStr]?.length || 0;
                      
                      // Check if this category has subcategories configured
                      const subCategoryConfig = subCategoryConfigs?.[String(groupValue)];
                      const hasSubCategories = !!subCategoryConfig;
                      const isExpanded = hasSubCategories && expandedCategories.has(String(groupValue));
                      
                      // Calculate subcategory selection state
                      let subCategoryState: { allSelected: boolean; someSelected: boolean; noneSelected: boolean } | null = null;
                      if (hasSubCategories && subCategoryConfig) {
                        const subCategoryKeys = subCategoryConfig.subCategoryOrder.map(sub => 
                          groupKeyToString({ type: "subCategory", value: sub })
                        );
                        const selectedSubCategories = subCategoryKeys.filter(key => 
                          getSelectedGroupsForTab("subCategory").has(key)
                        );
                        subCategoryState = {
                          allSelected: selectedSubCategories.length === subCategoryKeys.length && subCategoryKeys.length > 0,
                          someSelected: selectedSubCategories.length > 0 && selectedSubCategories.length < subCategoryKeys.length,
                          noneSelected: selectedSubCategories.length === 0,
                        };
                      }
                      
                      return (
                        <div key={groupKey} className="space-y-2">
                          <GroupCard
                            groupKey={groupKey}
                            groupValue={groupValue}
                            groupType={tabType}
                            isSelected={hasSubCategories && subCategoryState 
                              ? subCategoryState.allSelected 
                              : isSelected}
                            count={count}
                            label={config.getGroupLabel(groupValue)}
                            itemLabel={itemLabel}
                            onToggle={() => {
                              if (hasSubCategories && subCategoryConfig) {
                                // Toggle all subcategories when checkbox is clicked
                                const subCategoryKeys = subCategoryConfig.subCategoryOrder.map(sub => 
                                  groupKeyToString({ type: "subCategory", value: sub })
                                );
                                const currentSubSelections = getSelectedGroupsForTab("subCategory");
                                const allSelected = subCategoryKeys.every(key => currentSubSelections.has(key));
                                
                                setSelectedGroups((prev) => {
                                  const next = { ...prev };
                                  const subCategorySet = new Set(next["subCategory"] || []);
                                  
                                  if (allSelected) {
                                    // Deselect all subcategories
                                    subCategoryKeys.forEach(key => subCategorySet.delete(key));
                                  } else {
                                    // Select all subcategories
                                    subCategoryKeys.forEach(key => subCategorySet.add(key));
                                  }
                                  
                                  next["subCategory"] = subCategorySet;
                                  saveCurrentSelection(next);
                                  return next;
                                });
                              } else {
                                handleGroupToggle(tabType, groupValue);
                              }
                            }}
                            onAccordionToggle={hasSubCategories ? () => {
                              setExpandedCategories((prev) => {
                                const next = new Set(prev);
                                if (next.has(String(groupValue))) {
                                  next.delete(String(groupValue));
                                } else {
                                  next.add(String(groupValue));
                                }
                                return next;
                              });
                            } : undefined}
                            renderBadge={config.renderGroupBadge ? () => config.renderGroupBadge!(groupValue) : undefined}
                            isAccordion={hasSubCategories}
                            isExpanded={isExpanded}
                            isIndeterminate={hasSubCategories && subCategoryState 
                              ? subCategoryState.someSelected 
                              : false}
                          />
                          
                          {/* Accordion content for subcategories */}
                          {hasSubCategories && isExpanded && subCategoryConfig && (
                            <div className="ml-4 space-y-2 border-l-2 border-border pl-4">
                              {subCategoryConfig.subCategoryOrder.map((subValueStr) => {
                                const subGroupKey = groupKeyToString({ type: "subCategory", value: subValueStr });
                                const subIsSelected = getSelectedGroupsForTab("subCategory").has(subGroupKey);
                                const subCount = subCategoryConfig.subCategories[subValueStr]?.length || 0;
                                
                                return (
                                  <GroupCard
                                    key={subGroupKey}
                                    groupKey={subGroupKey}
                                    groupValue={subValueStr}
                                    groupType="subCategory"
                                    isSelected={subIsSelected}
                                    count={subCount}
                                    label={subCategoryConfig.subCategoryGroupConfig.getGroupLabel(subValueStr)}
                                    itemLabel={itemLabel}
                                    onToggle={() => handleGroupToggle("subCategory", subValueStr)}
                                    renderBadge={subCategoryConfig.subCategoryGroupConfig.renderGroupBadge ? () => subCategoryConfig.subCategoryGroupConfig.renderGroupBadge!(subValueStr) : undefined}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          <div className="p-4 border-t border-border bg-background mt-auto sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
              <Button
                variant="default"
                size="lg"
                onClick={handleStartQuiz}
                disabled={(() => {
                  const tabSelections = getSelectedGroupsForTab(activeTab).size;
                  // If on category tab, also check subcategory selections
                  if (activeTab === "category") {
                    const subCategorySelections = getSelectedGroupsForTab("subCategory").size;
                    return tabSelections === 0 && subCategorySelections === 0;
                  }
                  return tabSelections === 0;
                })()}
                className="w-full"
              >
                Start Quiz
              </Button>
              {(getSelectedGroupsForTab(activeTab).size > 0 || (activeTab === "category" && getSelectedGroupsForTab("subCategory").size > 0)) && (
                <Button variant="neutral" size="lg" onClick={handleClearAll} className="w-full">
                  Clear All
                </Button>
              )}
            </div>
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
              <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-0 w-full">
                <div className={`text-foreground thai-font text-center transition-all wrap-break-word w-full px-4 ${
                  currentItem.thai.length > 1 ? "text-5xl sm:text-6xl leading-tight" : "text-8xl leading-none"
                }`}>
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
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;
                  const optionSubLabel = typeof option === 'string' ? undefined : option.subLabel;
                  
                  const isSelected = selectedAnswer === optionValue;
                  const isCorrect = optionValue === correctAnswer;
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
                      key={`${optionValue}-${index}`}
                      variant="neutral"
                      size="lg"
                      onClick={() => handleAnswerSelect(optionValue)}
                      disabled={isDisabled}
                      className={`h-auto min-h-16 py-3 px-2 text-base sm:text-lg whitespace-normal ${backgroundColor || ""} border-2 border-border transition-all flex flex-col items-center justify-center gap-1 ${
                        isDisabled ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="leading-tight text-center">{optionLabel || "-"}</span>
                      {optionSubLabel && (
                        <span className="text-sm font-normal opacity-80 leading-tight text-center">{optionSubLabel}</span>
                      )}
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {sortedWrongAnswers.map((result, index) => {
                        const percentage = getFamiliarityPercentage(quizType, result.item.thai);
                        const isLong = result.item.thai.length > 8;
                        
                        let spanClass = "";
                        if (isLong) {
                          spanClass = "col-span-2 sm:col-span-2 md:col-span-2";
                        }
                        
                        return (
                          <div 
                            key={index} 
                            className={`flex flex-col items-center gap-1 w-full ${spanClass}`}
                          >
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

