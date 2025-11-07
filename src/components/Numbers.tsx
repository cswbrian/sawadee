import { numbers } from "@/data/numbers";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export const Numbers = () => {
  const renderCard = (thaiNumber: (typeof numbers)[0]) => (
    <motion.div
      key={thaiNumber.number}
      layoutId={`number-${thaiNumber.number}`}
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      <Card className="flex flex-col items-center justify-center p-3 min-h-[80px] bg-white">
        <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
          <div className="text-5xl text-foreground thai-font leading-none text-center">
            {thaiNumber.thai}
          </div>
          <div className="text-md text-muted-foreground text-center">
            {thaiNumber.number}
          </div>
          {thaiNumber.pronunciation && (
            <div className="text-sm text-muted-foreground text-center">
              {thaiNumber.pronunciation}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 text-center text-2xl">Numbers</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <motion.div
          layout
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11"
        >
          {numbers.map((thaiNumber) => renderCard(thaiNumber))}
        </motion.div>
      </div>
    </div>
  );
};

