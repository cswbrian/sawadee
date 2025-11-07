import { finalConsonantsBySound, finalSoundOrder } from "@/data/finalConsonants";
import { motion } from "framer-motion";
import { FinalConsonantCard } from "./FinalConsonantCard";
import { BackButton } from "@/components/ui/back-button";

export const FinalConsonants = () => {
  const renderCard = (finalConsonant: (typeof finalConsonantsBySound)[string][0]) => (
    <motion.div
      key={finalConsonant.thai}
      layoutId={`final-consonant-${finalConsonant.thai}`}
      layout
      transition={{
        layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      <FinalConsonantCard finalConsonant={finalConsonant} />
    </motion.div>
  );

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 text-center text-2xl">Final Consonants</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        <motion.div layout>
          {finalSoundOrder.map((sound) => (
            <div key={sound} className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">
                /{sound}/ sound
              </h2>
              <motion.div
                layout
                className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
              >
                {finalConsonantsBySound[sound]?.map((finalConsonant) =>
                  renderCard(finalConsonant)
                )}
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

