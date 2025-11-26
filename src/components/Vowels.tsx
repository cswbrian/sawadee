import { 
  vowels, 
  specialVowels, 
  type VowelGroup, 
  type VowelType,
  getVowelPairs,
  getGroupLabel,
  getGroupDescription,
  groupOrder
} from "@/data/vowels";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { VowelCard } from "./VowelCard";
import { BackButton } from "@/components/ui/back-button";
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { sortByFamiliarity, getFamiliarityPercentage } from "@/lib/utils";

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

export const Vowels = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "group";
  
  // Combine regular vowels and special vowels
  const allVowels = [...vowels, ...specialVowels];
  
  // Group vowels by group
  const groupedByGroup = allVowels.reduce(
    (acc, vowel) => {
      if (!acc[vowel.group]) {
        acc[vowel.group] = [];
      }
      acc[vowel.group].push(vowel);
      return acc;
    },
    {} as Record<VowelGroup, typeof allVowels>
  );

  // Group vowels by type
  const groupedByType = allVowels.reduce(
    (acc, vowel) => {
      if (!acc[vowel.type]) {
        acc[vowel.type] = [];
      }
      acc[vowel.type].push(vowel);
      return acc;
    },
    {} as Record<VowelType, typeof allVowels>
  );

  // Group vowels by familiarity
  const groupedByFamiliarity = useMemo(() => {
    const QUIZ_TYPE = "vowel" as const;
    const sorted = sortByFamiliarity(allVowels, QUIZ_TYPE);
    
    const groups: Record<string, typeof allVowels> = {
      "0-30": [],
      "30-50": [],
      "50-70": [],
      "70-90": [],
      "90-100": [],
      "no-data": [],
    };
    
    sorted.forEach((vowel) => {
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

  // Familiarity group order (least correct first)
  const familiarityOrder = ["0-30", "30-50", "50-70", "70-90", "90-100", "no-data"];

  // Helper to get familiarity range label with learning state
  const getFamiliarityRangeLabel = (range: string): string => {
    if (range === "no-data") return "No Data";
    
    // Map ranges to learning state labels
    const rangeLabels: Record<string, string> = {
      "0-30": "Struggling (0-30%)",
      "30-50": "Struggling (30-50%)",
      "50-70": "Learning (50-70%)",
      "70-90": "Familiar (70-90%)",
      "90-100": "Mastered (90-100%)",
    };
    
    return rangeLabels[range] || `${range}%`;
  };

  // Type order: long, short, special
  const typeOrder: VowelType[] = ["long", "short", "special"];

  const renderLegend = () => (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
      {typeOrder.map((type) => (
        <Badge
          key={type}
          className="text-xs"
          style={{ 
            backgroundColor: getTypeColor(type),
            color: "var(--foreground)"
          }}
        >
          {getTypeLabel(type)}
        </Badge>
      ))}
    </div>
  );

  const renderCard = (vowel: (typeof allVowels)[0]) => (
    <motion.div
      key={vowel.thai}
      layoutId={`vowel-${vowel.thai}`}
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      <VowelCard vowel={vowel} />
    </motion.div>
  );

  // Helper to render vowel pairs for group view
  const renderVowelPairs = (vowelsInGroup: typeof allVowels) => {
    const vowelPairs = getVowelPairs();
    const groupVowels = vowelsInGroup.filter(v => v.type !== "special");
    const specialVowelsInGroup = vowelsInGroup.filter(v => v.type === "special");
    
    // Get pairs that belong to this group
    const pairsInGroup = vowelPairs.filter(pair => 
      groupVowels.some(v => v.thai === pair.long.thai || v.thai === pair.short.thai)
    );

    return (
      <>
        {pairsInGroup.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-4 gap-4 mb-6"
          >
            {pairsInGroup.flatMap((pair) => [
              renderCard(pair.long),
              renderCard(pair.short)
            ])}
          </motion.div>
        )}
        {specialVowelsInGroup.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-4 gap-4"
          >
            {specialVowelsInGroup.map(vowel => renderCard(vowel))}
          </motion.div>
        )}
      </>
    );
  };

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 text-center text-2xl">Vowels</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="group" className="flex-1">
              Group
            </TabsTrigger>
            <TabsTrigger value="type" className="flex-1">
              Type
            </TabsTrigger>
            <TabsTrigger value="familiarity" className="flex-1">
              Familiarity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="group" asChild>
            <motion.div layout>
              {groupOrder.map((group) => {
                const vowelsInGroup = groupedByGroup[group] || [];
                if (vowelsInGroup.length === 0) return null;
                
                return (
                  <div key={group} className="mb-8">
                    <h2 className="mb-2 text-lg font-semibold">
                      {getGroupLabel(group)}
                    </h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {getGroupDescription(group)}
                    </p>
                    {renderVowelPairs(vowelsInGroup)}
                  </div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="type" asChild>
            <motion.div layout>
              {renderLegend()}
              {typeOrder.map((type) => {
                const vowelsInType = groupedByType[type] || [];
                if (vowelsInType.length === 0) return null;
                
                return (
                  <div key={type} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      {getTypeLabel(type)} Vowels
                    </h2>
                    <motion.div
                      layout
                      className="grid grid-cols-4 gap-4"
                    >
                      {vowelsInType.map(vowel => renderCard(vowel))}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="familiarity" asChild>
            <motion.div layout>
              {renderLegend()}
              {familiarityOrder.map((range) => {
                const vowelsInRange = groupedByFamiliarity[range] || [];
                if (vowelsInRange.length === 0) return null;
                
                return (
                  <div key={range} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      {getFamiliarityRangeLabel(range)} ({vowelsInRange.length} vowels)
                    </h2>
                    <motion.div
                      layout
                      className="grid grid-cols-4 gap-4"
                    >
                      {vowelsInRange.map(vowel => renderCard(vowel))}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

