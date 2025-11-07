import { getVowelPairs, specialVowels } from "@/data/vowels";
import { motion } from "framer-motion";
import { VowelCard } from "./VowelCard";
import { BackButton } from "@/components/ui/back-button";

export const Vowels = () => {
  const vowelPairs = getVowelPairs();

  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 text-center text-2xl">Vowels</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        {/* Long and Short Vowel Pairs - 4 columns alternating pattern */}
        <div className="mb-8">
          <motion.div
            layout
            className="grid grid-cols-4 gap-4"
          >
            {vowelPairs.flatMap((pair, index) => [
              <motion.div
                key={`long-${pair.long.thai}-${index}`}
                layoutId={`vowel-long-${pair.long.thai}-${index}`}
                layout
                transition={{
                  layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                }}
              >
                <VowelCard vowel={pair.long} />
              </motion.div>,
              <motion.div
                key={`short-${pair.short.thai}-${index}`}
                layoutId={`vowel-short-${pair.short.thai}-${index}`}
                layout
                transition={{
                  layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                }}
              >
                <VowelCard vowel={pair.short} />
              </motion.div>
            ])}
          </motion.div>
        </div>

        {/* Special Vowel Symbols Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-center">Special Vowel Symbols</h2>
          <motion.div
            layout
            className="grid grid-cols-4 gap-4"
          >
            {specialVowels.map((vowel, index) => (
              <motion.div
                key={`special-${vowel.thai}-${index}`}
                layoutId={`vowel-special-${vowel.thai}-${index}`}
                layout
                transition={{
                  layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                }}
              >
                <VowelCard vowel={vowel} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

