import { createContext, useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Consonants } from "@/components/Consonants";
import { Numbers } from "@/components/Numbers";
import { Quiz } from "@/components/Quiz";

const QuizContext = createContext<{
  isInQuiz: boolean;
  setIsInQuiz: (value: boolean) => void;
}>({
  isInQuiz: false,
  setIsInQuiz: () => {},
});

export const useQuizContext = () => useContext(QuizContext);

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
          Consonants
        </Link>
        <Link
          to="/numbers"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/numbers"
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Numbers
        </Link>
        <Link
          to="/quiz"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/quiz"
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Quiz
        </Link>
      </div>
    </nav>
  );
}

function App() {
  const [isInQuiz, setIsInQuiz] = useState(false);

  return (
    <BrowserRouter basename="/learn-thai-app">
      <QuizContext.Provider value={{ isInQuiz, setIsInQuiz }}>
        <div className={`min-h-svh bg-background ${isInQuiz ? "" : "pb-16"}`}>
          <Routes>
            <Route path="/" element={<Consonants />} />
            <Route path="/numbers" element={<Numbers />} />
            <Route path="/quiz" element={<Quiz />} />
          </Routes>
          <Navigation />
        </div>
      </QuizContext.Provider>
    </BrowserRouter>
  );
}

export default App;