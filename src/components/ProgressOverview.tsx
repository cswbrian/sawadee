import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getOverallStats, getCategoryStats, type CategoryStats } from "@/lib/stats";
import { consonants } from "@/data/consonants";
import { numbers } from "@/data/numbers";

const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    beginner: "var(--chart-3)", // Orange
    intermediate: "var(--chart-2)", // Blue
    advanced: "var(--chart-4)", // Green
    expert: "var(--chart-1)", // Yellow
  };
  return colors[level] || "var(--chart-5)";
};

interface CategoryCardProps {
  title: string;
  stats: CategoryStats;
  color: string;
}

const CategoryCard = ({ title, stats, color }: CategoryCardProps) => {
  const progress = (stats.mastered / stats.total) * 100;
  
  return (
    <Card className="p-4 bg-white">
      <CardContent className="p-0">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge 
            style={{ backgroundColor: color, color: "var(--foreground)" }}
            className="text-xs"
          >
            {Math.round(progress)}%
          </Badge>
        </div>
        <div className="mb-2 text-sm text-muted-foreground">
          {stats.mastered} / {stats.total} mastered
        </div>
        <Progress value={progress} className="h-3" />
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Familiar: </span>
            <span className="font-semibold">{stats.familiar}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Learning: </span>
            <span className="font-semibold">{stats.learning}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Struggling: </span>
            <span className="font-semibold">{stats.struggling}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Not Started: </span>
            <span className="font-semibold">{stats.notStarted}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProgressOverview = () => {
  // Hide final consonants and vowels until quizzes are ready
  const overallStats = useMemo(() => 
    getOverallStats(consonants, [], [], numbers),
    []
  );
  
  const categoryStats = useMemo(() => ({
    consonants: getCategoryStats("initial_consonant", consonants),
    numbers: getCategoryStats("number", numbers),
  }), []);

  const levelColor = getLevelColor(overallStats.level);

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-left text-2xl font-bold">Learning Progress</h2>
      
      {/* Overall Progress Card */}
      <Card className="mb-6 p-6 bg-white">
        <CardContent className="p-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Overall Progress</h3>
            <Badge 
              style={{ 
                backgroundColor: levelColor, 
                color: "var(--foreground)",
                fontSize: "0.875rem",
                padding: "0.5rem 1rem"
              }}
            >
              {overallStats.level.charAt(0).toUpperCase() + overallStats.level.slice(1)}
            </Badge>
          </div>
          
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Letters Mastered</span>
              <span className="text-lg font-bold">
                {overallStats.mastered} / {overallStats.totalLetters}
              </span>
            </div>
            <Progress value={overallStats.masteryPercentage} className="h-4" />
            <div className="mt-1 text-xs text-muted-foreground">
              {Math.round(overallStats.masteryPercentage)}% mastery
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Average Accuracy</div>
              <div className="text-xl font-bold">
                {Math.round(overallStats.averageAccuracy)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Attempts</div>
              <div className="text-xl font-bold">
                {overallStats.totalLetters - overallStats.notStarted}
              </div>
            </div>
          </div>

          {/* Familiarity Distribution */}
          <div className="mt-6 grid grid-cols-5 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--chart-4)" }}>
                {overallStats.mastered}
              </div>
              <div className="text-xs text-muted-foreground">Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--chart-2)" }}>
                {overallStats.familiar}
              </div>
              <div className="text-xs text-muted-foreground">Familiar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--chart-3)" }}>
                {overallStats.learning}
              </div>
              <div className="text-xs text-muted-foreground">Learning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--chart-5)" }}>
                {overallStats.struggling}
              </div>
              <div className="text-xs text-muted-foreground">Struggling</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {overallStats.notStarted}
              </div>
              <div className="text-xs text-muted-foreground">Not Started</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CategoryCard 
          title="Initial Consonants" 
          stats={categoryStats.consonants}
          color="var(--chart-2)"
        />
        <CategoryCard 
          title="Numbers" 
          stats={categoryStats.numbers}
          color="var(--chart-4)"
        />
      </div>
    </section>
  );
};

