import { useMemo } from "react";
import { numbers, type ThaiNumber } from "@/data/numbers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuiz } from "@/hooks/useQuiz";
import { sortByFamiliarity, getFamiliarityPercentage } from "@/lib/utils";

const QUIZ_TYPE = "number" as const;

const generateOptions = (correctNumber: ThaiNumber, allNumbers: ThaiNumber[]): string[] => {
  const correctAnswer = correctNumber.number.toString();
  
  // Get all unique number values
  const allNumberValues = Array.from(
    new Set(allNumbers.map((n) => n.number.toString()))
  );
  
  // Remove the correct answer from the pool
  const otherNumbers = allNumberValues.filter((num) => num !== correctAnswer);
  
  // Randomly select 5 wrong answers
  const wrongNumbers = [...otherNumbers]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  
  // Combine correct and wrong answers, then shuffle
  const allOptions = [correctAnswer, ...wrongNumbers].sort(
    () => Math.random() - 0.5
  );
  
  return allOptions;
};

export const NumbersQuiz = () => {
  const {
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
  } = useQuiz<ThaiNumber>({
    quizType: QUIZ_TYPE,
    items: numbers,
    getCorrectAnswer: (item) => item.number.toString(),
    generateOptions,
    maxQuestions: 10,
  });

  // Sort wrong answers by familiarity (least correct first)
  // This must be at the top level to follow Rules of Hooks
  const wrongAnswers = answerResults.filter((r) => !r.isCorrect);
  const sortedWrongAnswers = useMemo(() => {
    if (wrongAnswers.length === 0) return [];
    const wrongNumbers = wrongAnswers.map((r) => r.item);
    const sorted = sortByFamiliarity(wrongNumbers, QUIZ_TYPE);
    return sorted.map((number) => {
      const result = wrongAnswers.find((r) => r.item.thai === number.thai);
      return result!;
    });
  }, [wrongAnswers]);

  if (quizState === "selection") {
    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl">Numbers Quiz</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Practice reading Thai numbers. All numbers will be included in the quiz.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {numbers.map((number) => (
                  <div
                    key={number.thai}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="text-3xl thai-font">{number.thai}</div>
                    <div className="text-xs text-muted-foreground">
                      {number.number}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => startQuiz(numbers)}
              className="w-full max-w-md"
            >
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "quiz") {
    const currentNumber = selectedItems[currentIndex];
    const progress = ((currentIndex + 1) / selectedItems.length) * 100;

    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {currentIndex + 1} / {selectedItems.length}
              </span>
              <Button variant="neutral" size="sm" onClick={handleExitQuiz}>
                Exit
              </Button>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex flex-col items-center gap-8 py-8">
            <Card className="flex h-[280px] w-full max-w-md flex-col items-center justify-center p-8 bg-white">
              <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-0">
                <div className="text-8xl text-foreground thai-font leading-none">
                  {currentNumber.thai}
                </div>
                <div className="flex min-h-[80px] flex-col items-center justify-center gap-2">
                  {selectedAnswer !== null ? (
                    <div className="text-2xl font-semibold text-foreground">
                      {currentNumber.number}
                    </div>
                  ) : (
                    <div className="h-[52px]" />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {options.map((num, index) => {
                  const isSelected = selectedAnswer === num;
                  const isCorrect = num === currentNumber.number.toString();
                  const isWrong = isSelected && !isCorrect;
                  const isDisabled = selectedAnswer !== null;

                  let backgroundColor = undefined;
                  if (isDisabled) {
                    if (isCorrect) {
                      backgroundColor = "bg-green-500";
                    } else if (isWrong) {
                      backgroundColor = "bg-red-500";
                    }
                  }

                  return (
                    <Button
                      key={`${num}-${index}`}
                      variant="neutral"
                      size="lg"
                      onClick={() => handleAnswerSelect(num)}
                      disabled={isDisabled}
                      className={`h-16 text-xl ${backgroundColor || ""} border-2 border-border transition-all ${
                        isDisabled ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {num}
                    </Button>
                  );
                })}
              </div>

              <div className="flex h-11 justify-center">
                {selectedAnswer !== null && (
                  <Button variant="default" size="lg" onClick={handleNext}>
                    {currentIndex < selectedItems.length - 1 ? "Next" : "Finish"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "end") {
    const correctCount = answerResults.filter((r) => r.isCorrect).length;
    const totalQuestions = selectedItems.length;

    return (
      <div className="bg-background p-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[60vh] flex-col items-center gap-8 py-8">
            <Card className="w-full max-w-2xl p-8">
              <CardContent className="flex flex-col items-center gap-6 p-0">
                <h2 className="text-3xl font-bold">Quiz Complete!</h2>
                <div className="text-center">
                  <p className="text-2xl font-semibold">
                    {correctCount}/{totalQuestions} correct
                  </p>
                </div>

                {sortedWrongAnswers.length > 0 && (
                  <div className="w-full space-y-4">
                    <h3 className="text-lg font-semibold">Wrong Answers:</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {sortedWrongAnswers.map((result, index) => {
                        const percentage = getFamiliarityPercentage(QUIZ_TYPE, result.item.thai);
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="text-3xl thai-font">
                              {result.item.thai}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.item.number}
                            </div>
                            {percentage !== null && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round(percentage)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex w-full flex-col gap-3">
                  <Button variant="default" size="lg" onClick={handleRestart}>
                    Restart Quiz
                  </Button>
                  <Button variant="neutral" size="lg" onClick={handleReturnToSelection}>
                    Return to Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

