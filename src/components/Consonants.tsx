import { consonants, type ConsonantClass } from "@/data/consonants";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ConsonantCard } from "./ConsonantCard";
import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/components/ui/back-button";
import { useMemo } from "react";
import { sortByFamiliarity, getFamiliarityPercentage } from "@/lib/utils";

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


export const Consonants = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "class";
  
  // Group consonants by class
  const groupedByClass = consonants.reduce(
    (acc, consonant) => {
      if (!acc[consonant.class]) {
        acc[consonant.class] = [];
      }
      acc[consonant.class].push(consonant);
      return acc;
    },
    {} as Record<ConsonantClass, typeof consonants>
  );

  // Group consonants by consonant sound
  const groupedBySound = consonants.reduce(
    (acc, consonant) => {
      const sound = consonant.consonantSound || "empty";
      if (!acc[sound]) {
        acc[sound] = [];
      }
      acc[sound].push(consonant);
      return acc;
    },
    {} as Record<string, typeof consonants>
  );

  // Custom order for sounds: k (not g), kh, ng, ch, s, y, d, t, th, n, b, p, ph, f, m, r, l, w, h, ""
  const soundOrder = ["k", "kh", "ng", "ch", "s", "y", "d", "t", "th", "n", "b", "p", "ph", "f", "m", "r", "l", "w", "h", ""];
  const sortedSounds = Object.keys(groupedBySound).sort((a, b) => {
    const soundA = a === "empty" ? "" : a;
    const soundB = b === "empty" ? "" : b;
    const indexA = soundOrder.indexOf(soundA);
    const indexB = soundOrder.indexOf(soundB);
    // If sound not in order list, put it at the end
    if (indexA === -1 && indexB === -1) return soundA.localeCompare(soundB);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Group consonants by popularity
  const groupedByPopularity = consonants.reduce(
    (acc, consonant) => {
      const popularity = consonant.popularity ?? 999; // Treat undefined as least popular
      if (!acc[popularity]) {
        acc[popularity] = [];
      }
      acc[popularity].push(consonant);
      return acc;
    },
    {} as Record<number, typeof consonants>
  );

  // Sort popularity groups ascending (lower number = higher popularity)
  const sortedPopularities = Object.keys(groupedByPopularity)
    .map(Number)
    .sort((a, b) => a - b);

  // Group consonants by familiarity
  const groupedByFamiliarity = useMemo(() => {
    const QUIZ_TYPE = "initial_consonant" as const;
    const sorted = sortByFamiliarity(consonants, QUIZ_TYPE);
    
    const groups: Record<string, typeof consonants> = {
      "0-30": [],
      "30-50": [],
      "50-70": [],
      "70-90": [],
      "90-100": [],
      "no-data": [],
    };
    
    sorted.forEach((consonant) => {
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

  // Display order: high, mid, low
  const classOrder: ConsonantClass[] = ["high", "mid", "low"];

  // Helper function to sort consonants by class order (high, mid, low)
  const sortByClass = (consonantsArray: typeof consonants) => {
    return [...consonantsArray].sort((a, b) => {
      const classOrderMap: Record<ConsonantClass, number> = {
        high: 0,
        mid: 1,
        low: 2,
      };
      return classOrderMap[a.class] - classOrderMap[b.class];
    });
  };

  const renderLegend = () => (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
      {classOrder.map((classType) => (
        <Badge
          key={classType}
          className="text-xs"
          style={{ 
            backgroundColor: getClassColor(classType),
            color: "var(--foreground)"
          }}
        >
          {getClassLabel(classType)}
        </Badge>
      ))}
    </div>
  );

  const renderCard = (consonant: (typeof consonants)[0], showSound: boolean = true) => (
    <motion.div
      key={consonant.thai}
      layoutId={`consonant-${consonant.thai}`}
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      <ConsonantCard consonant={consonant} showSound={showSound} />
    </motion.div>
  );

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 text-center text-2xl">Initial Consonants</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="class" className="flex-1">
              Class
            </TabsTrigger>
            <TabsTrigger value="sound" className="flex-1">
              Sound
            </TabsTrigger>
            <TabsTrigger value="popularity" className="flex-1">
              Popularity
            </TabsTrigger>
            <TabsTrigger value="familiarity" className="flex-1">
              Familiarity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="class" asChild>
            <motion.div layout>
              {classOrder.map((classType) => (
                <div key={classType} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      {getClassLabel(classType)}
                    </h2>
                    <motion.div
                      layout
                      className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
                    >
                      {groupedByClass[classType]?.map((consonant) =>
                        renderCard(consonant)
                      )}
                    </motion.div>
                  </div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="sound" asChild>
            <motion.div layout>
              {renderLegend()}
              {sortedSounds.map((sound) => (
                <div key={sound} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      {sound === "empty" ? "Empty Sound" : `/${sound}/`}
                    </h2>
                    <motion.div
                      layout
                      className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
                    >
                      {sortByClass(groupedBySound[sound] || []).map((consonant) =>
                        renderCard(consonant, false)
                      )}
                    </motion.div>
                  </div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="popularity" asChild>
            <motion.div layout>
              {renderLegend()}
              {sortedPopularities.map((popularity) => (
                <div key={popularity} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      Popularity {popularity === 999 ? "Unknown" : popularity}
                    </h2>
                    <motion.div
                      layout
                      className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
                    >
                      {sortByClass(groupedByPopularity[popularity] || []).map((consonant) =>
                        renderCard(consonant)
                      )}
                    </motion.div>
                  </div>
                ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="familiarity" asChild>
            <motion.div layout>
              {renderLegend()}
              {familiarityOrder.map((range) => {
                const consonantsInRange = groupedByFamiliarity[range] || [];
                if (consonantsInRange.length === 0) return null;
                
                return (
                  <div key={range} className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold">
                      {getFamiliarityRangeLabel(range)} ({consonantsInRange.length} consonants)
                    </h2>
                    <motion.div
                      layout
                      className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
                    >
                      {consonantsInRange.map((consonant) =>
                        renderCard(consonant)
                      )}
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

