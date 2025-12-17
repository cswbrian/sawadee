import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StrugglingLetters } from "./StrugglingLetters";
import { ProgressOverview } from "./ProgressOverview";

export const Home = () => {
  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="my-6 text-left text-5xl font-bold">Sawadee</h1>
        
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

        {/* Thai Learning Resources Section */}
        <section className="mb-12">
          <h2 className="mb-4 text-left text-2xl font-bold">Thai Learning Resources</h2>
          <div className="flex flex-col gap-2">
            <a 
              href="https://www.activethai.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-foreground underline hover:text-chart-2 transition-colors inline-flex items-center gap-1 w-fit"
            >
              Active Thai
              <span className="text-xs">↗</span>
            </a>
            <a 
              href="https://funtolearnthai.com/beginners.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-foreground underline hover:text-chart-2 transition-colors inline-flex items-center gap-1 w-fit"
            >
              Fun to Learn Thai
              <span className="text-xs">↗</span>
            </a>
            <a 
              href="https://thai-notes.com/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-foreground underline hover:text-chart-2 transition-colors inline-flex items-center gap-1 w-fit"
            >
              Thai Notes
              <span className="text-xs">↗</span>
            </a>
          </div>
        </section>

        {/* Progress Overview Section */}
        <ProgressOverview />

        {/* Need Practice Section - replaces Quiz section */}
        <StrugglingLetters />
      </div>
    </div>
  );
};

