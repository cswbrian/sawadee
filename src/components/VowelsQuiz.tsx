import { useMemo } from "react";
import { 
  vowels, 
  specialVowels, 
  type Vowel, 
  type VowelGroup, 
  type VowelType,
  getGroupLabel,
  groupOrder
} from "@/data/vowels";
import { Badge } from "@/components/ui/badge";
import { VowelCard } from "./VowelCard";
import { LetterQuiz, type LetterQuizProps } from "./LetterQuiz";
import { getFamiliarityPercentage } from "@/lib/utils";

const QUIZ_TYPE = "vowel" as const;

const getTypeColor = (type: VowelType): string => {
  const colorMap: Record<VowelType, string> = {
    long: "var(--chart-3)",
    short: "var(--chart-4)",
    special: "var(--chart-2)",
  };
  return colorMap[type];
};

const getTypeLabel = (type: VowelType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
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

export const VowelsQuiz = () => {
  const allVowels = [...vowels, ...specialVowels];

  // Group vowels by group
  const groupedByGroup = useMemo(() => {
    return allVowels.reduce(
      (acc, vowel) => {
        if (!acc[vowel.group]) {
          acc[vowel.group] = [];
        }
        acc[vowel.group].push(vowel);
        return acc;
      },
      {} as Record<VowelGroup, Vowel[]>
    );
  }, []);

  // Group vowels by type
  const groupedByType = useMemo(() => {
    return allVowels.reduce(
      (acc, vowel) => {
        if (!acc[vowel.type]) {
          acc[vowel.type] = [];
        }
        acc[vowel.type].push(vowel);
        return acc;
      },
      {} as Record<VowelType, Vowel[]>
    );
  }, []);

  // Group vowels by familiarity ranges
  const groupedByFamiliarity = useMemo(() => {
    const groups: Record<string, Vowel[]> = {
      "0-30": [],
      "30-50": [],
      "50-70": [],
      "70-90": [],
      "90-100": [],
      "no-data": [],
    };
    
    allVowels.forEach((vowel) => {
      const percentage = getFamiliarityPercentage(QUIZ_TYPE, vowel.thai);
      
      if (percentage === null) {
        groups["no-data"].push(vowel);
      } else if (percentage < 30) {
        groups["0-30"].push(vowel);
      } else if (percentage < 50) {
        groups["30-50"].push(vowel);
      } else if (percentage < 70) {
        groups["50-70"].push(vowel);
      } else if (percentage < 90) {
        groups["70-90"].push(vowel);
      } else {
        groups["90-100"].push(vowel);
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

  const typeOrder: VowelType[] = ["long", "short", "special"];

  // Generate options for a vowel
  const generateOptions = (correctVowel: Vowel, allVowels: Vowel[]): string[] => {
    const correctSound = correctVowel.sound;
    
    const allSounds = Array.from(
      new Set(allVowels.map((v) => v.sound))
    );
    
    const otherSounds = allSounds.filter((sound) => sound !== correctSound);
    const wrongSounds = [...otherSounds]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    return [correctSound, ...wrongSounds].sort(() => Math.random() - 0.5);
  };

  // Group configurations
  const groupConfigs = useMemo((): LetterQuizProps<Vowel>["groupConfigs"] => {
    const groupGroupKeys = new Set<string>();
    groupOrder.forEach((group) => {
      groupGroupKeys.add(`group-${group}`);
    });

    const typeGroupKeys = new Set<string>();
    typeOrder.forEach((type) => {
      typeGroupKeys.add(`type-${type}`);
    });

    const familiarityGroupKeys = new Set<string>();
    filteredFamiliarityOrder.forEach((range) => {
      familiarityGroupKeys.add(`familiarity-${range}`);
    });

    return {
      group: {
        type: "group",
        label: "Group",
        getGroupKeys: () => groupGroupKeys,
        getGroupedItems: () => groupedByGroup,
        getGroupOrder: () => groupOrder,
        getGroupLabel: (value) => getGroupLabel(value as VowelGroup),
      },
      type: {
        type: "type",
        label: "Type",
        getGroupKeys: () => typeGroupKeys,
        getGroupedItems: () => groupedByType,
        getGroupOrder: () => typeOrder,
        getGroupLabel: (value) => getTypeLabel(value as VowelType),
        renderGroupBadge: (value) => (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: getTypeColor(value as VowelType),
              color: "var(--foreground)",
            }}
          >
            {getTypeLabel(value as VowelType)}
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
    };
  }, [groupedByGroup, groupedByType, groupedByFamiliarity, filteredFamiliarityOrder]);

  return (
    <LetterQuiz<Vowel>
      quizType={QUIZ_TYPE}
      allItems={allVowels}
      getCorrectAnswer={(v) => v.sound}
      generateOptions={generateOptions}
      renderCard={(v, showSound, showBadge) => (
        <VowelCard vowel={v} />
      )}
      getItemColor={(v) => getTypeColor(v.type)}
      getItemLabel={(v) => getTypeLabel(v.type)}
      tabTypes={["group", "type", "familiarity"]}
      groupConfigs={groupConfigs}
      title="Vowels Quiz - Select Group"
      itemLabel="vowels"
    />
  );
};

