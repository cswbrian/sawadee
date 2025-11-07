import { useState, useEffect } from "react";
import { useQuizContext } from "@/App";
import { loadSettings } from "@/lib/settings";
import { recordAnswer, selectWeighted, type QuizType } from "@/lib/stats";

export type QuizState = "selection" | "quiz" | "end";

export interface AnswerResult<T> {
  item: T;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface UseQuizOptions<T extends { thai: string }> {
  quizType: QuizType;
  items: T[];
  getCorrectAnswer: (item: T) => string;
  generateOptions: (item: T, allItems: T[]) => string[];
  maxQuestions?: number;
}

export function useQuiz<T extends { thai: string }>({
  quizType,
  items,
  getCorrectAnswer,
  generateOptions,
  maxQuestions = 10,
}: UseQuizOptions<T>) {
  const { setIsInQuiz } = useQuizContext();
  const [quizState, setQuizState] = useState<QuizState>("selection");
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answerResults, setAnswerResults] = useState<AnswerResult<T>[]>([]);

  // Update navigation visibility based on quiz state
  useEffect(() => {
    setIsInQuiz(quizState === "quiz");
    return () => {
      setIsInQuiz(false);
    };
  }, [quizState, setIsInQuiz]);

  // Warn user before leaving/refreshing during quiz
  useEffect(() => {
    if (quizState === "quiz") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [quizState]);

  const startQuiz = (itemsToQuiz: T[]) => {
    if (itemsToQuiz.length === 0) return;

    const settings = loadSettings();
    let shuffled: T[];

    if (settings.adaptiveLearning) {
      shuffled = selectWeighted(quizType, itemsToQuiz, maxQuestions);
      shuffled = shuffled.sort(() => Math.random() - 0.5);
    } else {
      shuffled = [...itemsToQuiz]
        .sort(() => Math.random() - 0.5)
        .slice(0, maxQuestions);
    }

    setSelectedItems(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
    if (shuffled.length > 0) {
      setOptions(generateOptions(shuffled[0], items));
    }
    setQuizState("quiz");
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer !== null && selectedItems[currentIndex]) {
      const currentItem = selectedItems[currentIndex];
      const isCorrect = selectedAnswer === getCorrectAnswer(currentItem);

      recordAnswer(quizType, currentItem.thai, isCorrect);

      setAnswerResults((prev) => [
        ...prev,
        {
          item: currentItem,
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
        },
      ]);
    }

    if (currentIndex < selectedItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setOptions(generateOptions(selectedItems[nextIndex], items));
    } else {
      setQuizState("end");
    }
  };

  const handleRestart = () => {
    startQuiz(selectedItems);
  };

  const handleReturnToSelection = () => {
    setQuizState("selection");
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResults([]);
  };

  const handleExitQuiz = () => {
    if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
      setQuizState("selection");
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerResults([]);
    }
  };

  return {
    quizState,
    selectedItems,
    currentIndex,
    selectedAnswer,
    options,
    answerResults,
    startQuiz,
    handleAnswerSelect,
    handleNext,
    handleRestart,
    handleReturnToSelection,
    handleExitQuiz,
  };
}

