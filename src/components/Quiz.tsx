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

          {/* Placeholder for future quizzes */}
          <Button
            variant="default"
            size="lg"
            disabled
            className="w-full text-sm py-4 flex-col h-auto bg-white opacity-50 cursor-not-allowed border-2 border-border"
            style={{
              backgroundColor: "white",
              color: "var(--foreground)",
            }}
          >
            <span className="thai-font text-4xl mb-2">ม</span>
            <span>Final Consonants</span>
          </Button>

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
    </div>
  );
};
