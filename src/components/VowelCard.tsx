import type { Vowel } from "@/data/vowels";
import { Card, CardContent } from "@/components/ui/card";

interface VowelCardProps {
  vowel: Vowel;
}

const getTypeColor = (type: "long" | "short" | "special"): string => {
  const colorMap = {
    long: "var(--chart-3)",
    short: "var(--chart-4)",
    special: "var(--chart-2)",
  };
  return colorMap[type];
};

export const VowelCard = ({ vowel }: VowelCardProps) => {
  const bgColor = getTypeColor(vowel.type);
  // Use different font sizes based on character length
  const charLength = vowel.thai.length;
  let textSizeClass: string;
  
  if (charLength >= 3) {
    // 3+ characters: medium size
    textSizeClass = "text-3xl sm:text-3xl md:text-4xl lg:text-5xl";
  } else {
    // 1-2 characters: largest size
    textSizeClass = "text-5xl";
  }

  return (
    <Card
      className="flex flex-col items-center justify-center py-1 h-[100px] w-full"
      style={{ backgroundColor: bgColor }}
    >
      <CardContent className="flex flex-col items-center justify-center p-0 gap-1 h-full">
        <div className={`${textSizeClass} text-foreground thai-font leading-tight text-center flex items-center justify-center flex-1`}>
          {vowel.thai}
        </div>
        <div className="text-md text-muted-foreground text-center">
          {vowel.sound}
        </div>
      </CardContent>
    </Card>
  );
};

