import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Letters = () => {
  return (
    <div className="bg-background p-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="my-6 text-left text-5xl font-bold">Letters</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/letters/consonants" className="w-full">
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
          <Link to="/letters/final-consonants" className="w-full">
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
          <Link to="/letters/vowels" className="w-full">
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
          <Link to="/letters/numbers" className="w-full">
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
      </div>
    </div>
  );
};

