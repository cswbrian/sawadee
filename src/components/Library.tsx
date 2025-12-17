import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel, type WordCategory, categoryOrder, words } from "@/data/words";
import { useMemo } from "react";

export const Library = () => {
  // Count words by category
  const wordCountsByCategory = useMemo(() => {
    const counts: Record<WordCategory, number> = {
      greetings: 0,
      basics: 0,
      food: 0,
      drink: 0,
      places: 0,
      directions: 0,
      shopping: 0,
    };
    
    words.forEach(word => {
      counts[word.category]++;
    });
    
    return counts;
  }, []);

  const totalWordCount = words.length;

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="my-6 text-left text-5xl font-bold">Library</h1>
        
        {/* Letters Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-left text-2xl font-bold">Letters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <Link to="/library/consonants" className="w-full">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full text-md py-6 flex-col h-auto"
                style={{ 
                  backgroundColor: "var(--chart-2)",
                  borderColor: "var(--border)"
                }}
              >
                <span className="thai-font text-5xl mb-2">ก</span>
                <span>Initial Consonants</span>
              </Button>
            </Link>
            <Link to="/library/final-consonants" className="w-full">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full text-md py-6 flex-col h-auto"
                style={{ 
                  backgroundColor: "var(--chart-1)",
                  borderColor: "var(--border)"
                }}
              >
                <span className="thai-font text-5xl mb-2">ม</span>
                <span>Final Consonants</span>
              </Button>
            </Link>
            <Link to="/library/vowels" className="w-full">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full text-md py-6 flex-col h-auto"
                style={{ 
                  backgroundColor: "var(--chart-3)",
                  borderColor: "var(--border)"
                }}
              >
                <span className="thai-font text-5xl mb-2">อา</span>
                <span>Vowels</span>
              </Button>
            </Link>
            <Link to="/library/numbers" className="w-full">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full text-md py-6 flex-col h-auto"
                style={{ 
                  backgroundColor: "var(--chart-4)",
                  borderColor: "var(--border)"
                }}
              >
                <span className="thai-font text-5xl mb-2">๑</span>
                <span>Numbers</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Words Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-left text-2xl font-bold">Words</h2>
          <div className="space-y-2">
            {categoryOrder.map((category) => {
              const getCategoryColor = (cat: WordCategory): string => {
                const colorMap: Record<WordCategory, string> = {
                  greetings: "var(--chart-1)",
                  basics: "var(--chart-2)",
                  food: "var(--chart-3)",
                  drink: "var(--chart-4)",
                  places: "var(--chart-5)",
                  directions: "var(--chart-1)",
                  shopping: "var(--chart-2)",
                };
                return colorMap[cat];
              };

              const getCategoryExample = (cat: WordCategory): string => {
                const examples: Record<WordCategory, string> = {
                  greetings: "สวัสดี",
                  basics: "ใช่",
                  food: "ข้าว",
                  drink: "น้ำ",
                  places: "บ้าน",
                  directions: "ซ้าย",
                  shopping: "เท่าไหร่",
                };
                return examples[cat];
              };

              const bgColor = getCategoryColor(category);
              const example = getCategoryExample(category);

              return (
                <Link key={category} to={`/library/words?category=${category}`} className="block">
                  <Card
                    className="w-full py-0 bg-white transition-colors hover:bg-secondary-background"
                    style={{ borderLeftColor: bgColor, borderLeftWidth: "3px" }}
                  >
                    <CardContent className="p-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-2xl sm:text-3xl text-foreground thai-font leading-tight shrink-0">
                            {example}
                          </div>
                          <div className="text-base sm:text-lg text-foreground font-medium">
                            {getCategoryLabel(category)}
                          </div>
                        </div>
                        <Badge
                          className="text-xs shrink-0"
                          style={{
                            backgroundColor: bgColor,
                            color: "var(--foreground)",
                          }}
                        >
                          {wordCountsByCategory[category]} words
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            <Link to="/library/words" className="block">
              <Card
                className="w-full py-0 bg-white transition-colors hover:bg-secondary-background"
                style={{ borderLeftColor: "var(--chart-3)", borderLeftWidth: "3px" }}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl text-foreground thai-font leading-tight shrink-0">
                        ทั้งหมด
                      </div>
                      <div className="text-base sm:text-lg text-foreground font-medium">
                        All Words
                      </div>
                    </div>
                    <Badge
                      className="text-xs shrink-0"
                      style={{
                        backgroundColor: "var(--chart-3)",
                        color: "var(--foreground)",
                      }}
                    >
                      {totalWordCount} words
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

