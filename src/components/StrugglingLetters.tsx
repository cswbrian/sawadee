import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadStats, getCorrectPercentage, type QuizType } from "@/lib/stats";
import { consonants } from "@/data/consonants";
import { numbers } from "@/data/numbers";

interface StrugglingLetter {
  thai: string;
  quizType: QuizType;
  correctRate: number;
  attempts: number;
  value: string; // consonantSound for consonants, number.toString() for numbers
}

const getQuizTypeLabel = (quizType: QuizType): string => {
  const labels: Record<QuizType, string> = {
    initial_consonant: "Initial Consonants",
    final_consonant: "Final Consonants",
    vowel: "Vowels",
    number: "Numbers",
  };
  return labels[quizType];
};

const getQuizTypePath = (quizType: QuizType): string => {
  const paths: Record<QuizType, string> = {
    initial_consonant: "/quiz/initial-consonants",
    final_consonant: "/quiz/final-consonants",
    vowel: "/quiz/vowels",
    number: "/quiz/numbers",
  };
  return paths[quizType];
};

export const StrugglingLetters = () => {
  const strugglingLetters = useMemo(() => {
    const allStruggling: StrugglingLetter[] = [];

    // Check initial consonants
    const consonantStats = loadStats("initial_consonant");
    consonants.forEach((consonant) => {
      const stats = consonantStats[consonant.thai];
      if (stats) {
        const percentage = getCorrectPercentage(stats);
        if (percentage !== null && percentage < 70) {
          allStruggling.push({
            thai: consonant.thai,
            quizType: "initial_consonant",
            correctRate: percentage,
            attempts: stats.attempts,
            value: consonant.consonantSound || "",
          });
        }
      }
    });

    // Check numbers
    const numberStats = loadStats("number");
    numbers.forEach((number) => {
      const stats = numberStats[number.thai];
      if (stats) {
        const percentage = getCorrectPercentage(stats);
        if (percentage !== null && percentage < 70) {
          allStruggling.push({
            thai: number.thai,
            quizType: "number",
            correctRate: percentage,
            attempts: stats.attempts,
            value: number.number.toString(),
          });
        }
      }
    });

    // Sort by correct rate (lowest first), then by attempts (most attempts first)
    return allStruggling.sort((a, b) => {
      if (a.correctRate !== b.correctRate) {
        return a.correctRate - b.correctRate;
      }
      return b.attempts - a.attempts;
    });
  }, []);

  if (strugglingLetters.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="mb-6 text-left text-2xl font-bold">Quiz</h2>
        <Link to="/quiz" className="w-full">
          <Button 
            variant="default" 
            size="lg" 
            className="w-full text-lg py-8 flex-col h-auto"
            style={{ 
              backgroundColor: "var(--chart-5)",
              borderColor: "var(--border)"
            }}
          >
            <span className="thai-font text-5xl mb-2">📝</span>
            <span>Start Quiz</span>
          </Button>
        </Link>
      </section>
    );
  }

  // Group by quiz type and limit per type
  const groupedByType = strugglingLetters.reduce(
    (acc, letter) => {
      if (!acc[letter.quizType]) {
        acc[letter.quizType] = [];
      }
      acc[letter.quizType].push(letter);
      return acc;
    },
    {} as Record<QuizType, StrugglingLetter[]>
  );

  // Apply limits per quiz type
  const getMaxCards = (quizType: QuizType): number => {
    if (quizType === "initial_consonant") return 9;
    if (quizType === "number") return 3;
    return 6; // Default for other types
  };

  // Limit each group
  Object.keys(groupedByType).forEach((quizType) => {
    groupedByType[quizType as QuizType] = groupedByType[quizType as QuizType].slice(
      0,
      getMaxCards(quizType as QuizType)
    );
  });

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-left text-2xl font-bold">Need Practice</h2>
      <div className="space-y-6">
        {Object.entries(groupedByType).map(([quizType, letters]) => (
          <div key={quizType}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {getQuizTypeLabel(quizType as QuizType)}
              </h3>
              <Link
                to={getQuizTypePath(quizType as QuizType)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Practice →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {letters.map((letter) => (
                <Card
                  key={`${letter.quizType}-${letter.thai}`}
                  className="flex flex-col items-center justify-center p-3 min-h-[100px] bg-white"
                >
                  <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
                    <div className="text-5xl text-foreground thai-font leading-none text-center">
                      {letter.thai}
                    </div>
                    <div className="text-base text-muted-foreground text-center">
                      {letter.value || "-"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

