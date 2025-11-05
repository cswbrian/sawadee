import type { Consonant, ConsonantClass } from "@/data/consonants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getClassColor = (classType: ConsonantClass): string => {
  const colorMap: Record<ConsonantClass, string> = {
    high: "var(--chart-2)",
    mid: "var(--chart-3)",
    low: "var(--chart-4)",
  };
  return colorMap[classType];
};

interface ConsonantCardProps {
  consonant: Consonant;
  showSound?: boolean;
  showBadge?: boolean;
}

export const ConsonantCard = ({ consonant, showSound = true, showBadge = false }: ConsonantCardProps) => {
  const bgColor = getClassColor(consonant.class);

  return (
    <Card
      className="flex flex-col items-center justify-center p-3 min-h-[80px]"
      style={{ backgroundColor: bgColor }}
    >
      <CardContent className={`flex flex-col items-center justify-center p-0 ${showSound || showBadge ? 'gap-2' : ''}`}>
        <div className="text-5xl text-foreground thai-font leading-none text-center">
          {consonant.thai}
        </div>
        {showSound && (
          <div className="text-md text-muted-foreground text-center">
            {consonant.consonantSound || "-"}
          </div>
        )}
        {showBadge && (
          <Badge
            className="text-xs"
            style={{
              backgroundColor: getClassColor(consonant.class),
              color: "var(--foreground)",
            }}
          >
            {consonant.class.charAt(0).toUpperCase() + consonant.class.slice(1)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

