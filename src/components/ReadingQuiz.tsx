import { useMemo } from "react";
import { consonants, type Consonant, type ConsonantClass } from "@/data/consonants";
import { Badge } from "@/components/ui/badge";
import { ConsonantCard } from "./ConsonantCard";
import { LetterQuiz, type LetterQuizProps } from "./LetterQuiz";
import { getFamiliarityPercentage } from "@/lib/utils";

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

export const ReadingQuiz = () => {
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

  const filteredFamiliarityOrder = useMemo(() => {
    return familiarityOrder.filter((range) => {
      return groupedByFamiliarity[range] && groupedByFamiliarity[range].length > 0;
    });
  }, [groupedByFamiliarity]);

  // Generate options for a consonant
  const generateOptions = (correctConsonant: Consonant, allConsonants: Consonant[]): string[] => {
    const correctSound = correctConsonant.consonantSound || "";
    
    const allSounds = Array.from(
      new Set(allConsonants.map((c) => c.consonantSound || ""))
    );
    
    const otherSounds = allSounds.filter((sound) => sound !== correctSound);
    const wrongSounds = [...otherSounds]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    return [correctSound, ...wrongSounds].sort(() => Math.random() - 0.5);
  };

  // Group configurations
  const groupConfigs = useMemo((): LetterQuizProps<Consonant>["groupConfigs"] => {
    const classGroupKeys = new Set<string>();
    (["high", "mid", "low"] as ConsonantClass[]).forEach((classType) => {
      classGroupKeys.add(`class-${classType}`);
    });

    const popularityGroupKeys = new Set<string>();
    sortedPopularities.forEach((popularity) => {
      popularityGroupKeys.add(`popularity-${popularity}`);
    });

    const familiarityGroupKeys = new Set<string>();
    filteredFamiliarityOrder.forEach((range) => {
      familiarityGroupKeys.add(`familiarity-${range}`);
    });

    return {
      class: {
        type: "class",
        label: "Class",
        getGroupKeys: () => classGroupKeys,
        getGroupedItems: () => groupedByClass,
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
        getGroupKeys: () => popularityGroupKeys,
        getGroupedItems: () => groupedByPopularity,
        getGroupOrder: () => sortedPopularities.map(String),
        getGroupLabel: (value) => `Popularity ${value === 999 ? "Unknown" : value}`,
      },
      familiarity: {
        type: "familiarity",
        label: "Familiarity",
        getGroupKeys: () => familiarityGroupKeys,
        getGroupedItems: () => groupedByFamiliarity,
        getGroupOrder: () => filteredFamiliarityOrder,
        getGroupLabel: (value) => getFamiliarityRangeLabel(value as string),
      },
    };
  }, [groupedByClass, groupedByPopularity, groupedByFamiliarity, sortedPopularities, filteredFamiliarityOrder]);

  return (
    <LetterQuiz<Consonant>
      quizType={QUIZ_TYPE}
      allItems={consonants}
      getCorrectAnswer={(c) => c.consonantSound || ""}
      generateOptions={generateOptions}
      renderCard={(c, showSound, showBadge) => (
        <ConsonantCard consonant={c} showSound={showSound} showBadge={showBadge} />
      )}
      getItemColor={(c) => getClassColor(c.class)}
      getItemLabel={(c) => getClassLabel(c.class)}
      getItemSubLabel={(c) => c.thaiName}
      tabTypes={["class", "popularity", "familiarity"]}
      groupConfigs={groupConfigs}
      title="Reading Quiz - Select Group"
      itemLabel="consonants"
    />
  );
};
