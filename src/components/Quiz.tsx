import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Quiz = () => {
  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
        <h1 className="mt-6 text-left text-5xl font-bold">Quiz</h1>
          <p className="mt-2 text-muted-foreground">
            Practice and test your knowledge of Thai letters
          </p>
        </div>

        {/* Group 1: Initial Consonants, Vowels, Numbers */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Letters & Numbers</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link to="/quiz/initial-consonants" className="w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full text-sm py-4 flex-col h-auto bg-white hover:bg-gray-50 border-2 border-border"
                style={{
                  backgroundColor: "white",
                  color: "var(--foreground)",
                }}
              >
                <span className="thai-font text-4xl mb-2">ก</span>
                <span>Initial Consonants</span>
              </Button>
            </Link>

            <Link to="/quiz/vowels" className="w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full text-sm py-4 flex-col h-auto bg-white hover:bg-gray-50 border-2 border-border"
                style={{
                  backgroundColor: "white",
                  color: "var(--foreground)",
                }}
              >
                <span className="thai-font text-4xl mb-2">อา</span>
                <span>Vowels</span>
              </Button>
            </Link>

            <Link to="/quiz/numbers" className="w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full text-sm py-4 flex-col h-auto bg-white hover:bg-gray-50 border-2 border-border"
                style={{
                  backgroundColor: "white",
                  color: "var(--foreground)",
                }}
              >
                <span className="thai-font text-4xl mb-2">๑</span>
                <span>Numbers</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Group 2: Words & Dishes */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Words & Phrases</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link to="/quiz/words" className="w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full text-sm py-4 flex-col h-auto bg-white hover:bg-gray-50 border-2 border-border"
                style={{
                  backgroundColor: "white",
                  color: "var(--foreground)",
                }}
              >
                <span className="thai-font text-4xl mb-2">ข้าว</span>
                <span>Tourist Words</span>
              </Button>
            </Link>

            <Link to="/quiz/dishes" className="w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full text-sm py-4 flex-col h-auto bg-white hover:bg-gray-50 border-2 border-border"
                style={{
                  backgroundColor: "white",
                  color: "var(--foreground)",
                }}
              >
                <span className="thai-font text-4xl mb-2">ต้มยำ</span>
                <span>Dish Builder</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
