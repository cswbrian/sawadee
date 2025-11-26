import { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Consonants } from "@/components/Consonants";
import { Numbers } from "@/components/Numbers";
import { Quiz } from "@/components/Quiz";
import { Vowels } from "@/components/Vowels";
import { Home } from "@/components/Home";
import { FinalConsonants } from "@/components/FinalConsonants";
import { Letters } from "@/components/Letters";
import { Settings } from "@/components/Settings";
import { ReadingQuiz } from "@/components/ReadingQuiz";
import { NumbersQuiz } from "@/components/NumbersQuiz";
import { VowelsQuiz } from "@/components/VowelsQuiz";
import { useAnalytics } from "@/hooks/useAnalytics";

const QuizContext = createContext<{
  isInQuiz: boolean;
  setIsInQuiz: (value: boolean) => void;
}>({
  isInQuiz: false,
  setIsInQuiz: () => {},
});

export const useQuizContext = () => useContext(QuizContext);

// Scroll to top on route change and track analytics
function ScrollToTop() {
  const { pathname } = useLocation();
  useAnalytics(); // Track page views

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Navigation() {
  const location = useLocation();
  const { isInQuiz } = useQuizContext();

  // Hide navigation during quiz
  if (isInQuiz) {
    return null;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-background">
      <div className="flex h-16">
        <Link
          to="/"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/"
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Home
        </Link>
        <Link
          to="/letters"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/letters" || location.pathname.startsWith("/letters/")
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Letters
        </Link>
        <Link
          to="/quiz"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/quiz" || location.pathname.startsWith("/quiz/")
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Quiz
        </Link>
        <Link
          to="/settings"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/settings"
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Settings
        </Link>
      </div>
    </nav>
  );
}

function App() {
  const [isInQuiz, setIsInQuiz] = useState(false);

  // Detect basename dynamically based on the hostname
  // If we're on GitHub Pages (cswbrian.github.io), use /sawadee as basename
  // Otherwise, use empty string for custom domain
  const getBasename = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // If on GitHub Pages domain, use /sawadee basename
      if (hostname === 'cswbrian.github.io') {
        return '/sawadee';
      }
    }
    // For custom domain or localhost, use empty basename
    return '';
  };

  return (
    <BrowserRouter basename={getBasename()}>
      <QuizContext.Provider value={{ isInQuiz, setIsInQuiz }}>
        <ScrollToTop />
        <div className={`min-h-svh bg-background ${isInQuiz ? "" : "pb-16"}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/letters/consonants" element={<Consonants />} />
            <Route path="/letters/final-consonants" element={<FinalConsonants />} />
            <Route path="/letters/vowels" element={<Vowels />} />
            <Route path="/letters/numbers" element={<Numbers />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/initial-consonants" element={<ReadingQuiz />} />
            <Route path="/quiz/vowels" element={<VowelsQuiz />} />
            <Route path="/quiz/numbers" element={<NumbersQuiz />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <Navigation />
        </div>
      </QuizContext.Provider>
    </BrowserRouter>
  );
}

export default App;