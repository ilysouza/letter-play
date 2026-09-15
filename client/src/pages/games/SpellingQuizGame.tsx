import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult, Hearts, HintBox } from "@/components/GameShared";
import { getDailyQuizQuestions, QuizQuestion, generateSpellingHint } from "@/dailyWords";
import { updateStudentScore, getStudentRound } from "@/store";
import { speak } from "@/audio";
import { Volume2 } from "lucide-react";

interface Props {
  student: Student;
  onBack: () => void;
}

const MAX_LIVES = 2;

export default function SpellingQuizGame({ student, onBack }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [selectedCorrect, setSelectedCorrect] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const correctCountRef = useRef(0);
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const list = getDailyQuizQuestions(getStudentRound(student.id, "spelling-quiz", 5));
    setQuestions(list);
    initQuestion(list[0], 0);
  }, []);

  const currentQ = questions[currentIndex];

  const initQuestion = (q: QuizQuestion, idx: number) => {
    if (!q) return;
    currentIndexRef.current = idx;
    setLives(MAX_LIVES);
    setDisabledOptions([]);
    setSelectedCorrect(null);
    setRevealing(false);
    isTransitioningRef.current = false;

    if (student.audioEnabled) {
      speak(q.word);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (revealing || isTransitioningRef.current || disabledOptions.includes(opt) || !currentQ) return;

    if (opt === currentQ.word) {
      // Acerto
      isTransitioningRef.current = true;
      setSelectedCorrect(opt);
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);

      setTimeout(() => {
        advanceNext();
      }, 900);
    } else {
      // Erro
      const nextDisabled = [...disabledOptions, opt];
      setDisabledOptions(nextDisabled);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setRevealing(true);
        isTransitioningRef.current = true;
        setTimeout(() => {
          advanceNext();
        }, 1400);
      }
    }
  };

  const advanceNext = () => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < questions.length) {
      setCurrentIndex(nextIdx);
      initQuestion(questions[nextIdx], nextIdx);
    } else {
      const finalScore = Math.round((correctCountRef.current / questions.length) * 100);
      const finalXP = correctCountRef.current * 15;
      updateStudentScore(student.id, "spelling-quiz", finalScore, finalXP);
      setFinished(true);
    }
  };

  if (!currentQ) {
    return <div className="p-8 text-center text-xl font-bold">Carregando quiz...</div>;
  }

  if (finished) {
    const finalScore = Math.round((correctCount / questions.length) * 100);
    return (
      <GameResult
        score={finalScore}
        total={questions.length}
        correct={correctCount}
        xpEarned={correctCount * 15}
        onBack={onBack}
      />
    );
  }

  const hintText = generateSpellingHint(currentQ.word, currentQ.options);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <GameHeader
        title="Quiz de Ortografia"
        emoji="🔡"
        onBack={onBack}
        progress={currentIndex + 1}
        total={questions.length}
        score={correctCount}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        <Hearts lives={lives} maxLives={MAX_LIVES} />

        {lives < MAX_LIVES && lives > 0 && !revealing && <HintBox hint={hintText} />}

        <div className="flex flex-col items-center justify-center my-4">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
            Como se escreve?
          </div>
          <div className="relative group">
            <img
              src={currentQ.image}
              alt="Ilustração"
              className="w-40 h-40 sm:w-44 sm:h-44 object-cover rounded-lg border-4 border-slate-300 shadow-sm"
            />
            {student.audioEnabled && (
              <button
                onClick={() => speak(currentQ.word)}
                className="absolute bottom-2 right-2 bg-slate-500 hover:bg-amber-600 text-white p-2.5 rounded-full shadow-sm active:scale-90 transition-all"
                title="Ouvir palavra"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Grade 2x2 com opções */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto my-6">
          {currentQ.options.map((option, idx) => {
            const isCorrect = option === currentQ.word;
            const isSelectedCorrect = selectedCorrect === option;
            const isDisabled = disabledOptions.includes(option);
            const isRevealedCorrect = revealing && isCorrect;

            let btnStyle = "bg-white hover:bg-slate-50 border-slate-300 text-slate-900";
            if (isSelectedCorrect || isRevealedCorrect) {
              btnStyle = "bg-emerald-500 border-emerald-600 text-white scale-102 shadow-sm";
            } else if (isDisabled) {
              btnStyle = "bg-rose-100 border-rose-300 text-rose-400 opacity-60 cursor-not-allowed line-through";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isDisabled || revealing || selectedCorrect !== null}
                className={`py-4 px-6 rounded-lg font-['Fredoka'] text-2xl font-bold border-2 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{option}</span>
                {(isSelectedCorrect || isRevealedCorrect) && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
