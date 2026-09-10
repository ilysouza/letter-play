import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult, Hearts, HintBox } from "@/components/GameShared";
import { updateStudentScore } from "@/store";
import { speakMath } from "@/audio";
import { Timer, Volume2 } from "lucide-react";
import { shuffle } from "@/dailyWords";

interface Props {
  student: Student;
  onBack: () => void;
}

interface MathQuestion {
  a: number;
  op: "+" | "-";
  b: number;
  answer: number;
  options: number[];
}

const TOTAL_QUESTIONS = 8;
const MAX_LIVES = 2;
const TIME_PER_QUESTION = 20;

export default function MathGame({ student, onBack }: Props) {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [selectedCorrect, setSelectedCorrect] = useState<number | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const correctCountRef = useRef(0);
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    // Gerar 8 questões proceduralmente: 55% adição, 45% subtração
    const list: MathQuestion[] = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const isAdd = Math.random() < 0.55;
      let a: number, b: number, answer: number;
      const op: "+" | "-" = isAdd ? "+" : "-";

      if (isAdd) {
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        answer = a + b;
      } else {
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1; // Subtração positiva garantida
        answer = a - b;
      }

      // Gerar 3 distratores numéricos plausíveis com delta ±1 a ±4
      const distSet = new Set<number>();
      distSet.add(answer);
      while (distSet.size < 4) {
        const delta = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
        const candidate = answer + delta;
        if (candidate >= 0 && candidate !== answer) {
          distSet.add(candidate);
        }
      }

      list.push({
        a,
        op,
        b,
        answer,
        options: shuffle(Array.from(distSet)),
      });
    }

    setQuestions(list);
    initQuestion(list[0], 0);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];

  const initQuestion = (q: MathQuestion, idx: number) => {
    if (!q) return;
    currentIndexRef.current = idx;
    setLives(MAX_LIVES);
    setTimeLeft(TIME_PER_QUESTION);
    setDisabledOptions([]);
    setSelectedCorrect(null);
    setRevealing(false);
    isTransitioningRef.current = false;

    if (student.audioEnabled) {
      speakMath(q.a, q.op, q.b);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setRevealing(true);
    setTimeout(() => {
      advanceNext();
    }, 1400);
  };

  const handleSelectOption = (num: number) => {
    if (revealing || isTransitioningRef.current || disabledOptions.includes(num) || !currentQ) return;

    if (num === currentQ.answer) {
      // Acerto
      if (timerRef.current) clearInterval(timerRef.current);
      isTransitioningRef.current = true;
      setSelectedCorrect(num);
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);

      setTimeout(() => {
        advanceNext();
      }, 900);
    } else {
      // Erro
      const nextDisabled = [...disabledOptions, num];
      setDisabledOptions(nextDisabled);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
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
      if (timerRef.current) clearInterval(timerRef.current);
      const finalScore = Math.round((correctCountRef.current / questions.length) * 100);
      const finalXP = correctCountRef.current * 15;
      updateStudentScore(student.id, "math", finalScore, finalXP);
      setFinished(true);
    }
  };

  if (!currentQ) {
    return <div className="p-8 text-center text-xl font-bold">Preparando contas...</div>;
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

  const isAddition = currentQ.op === "+";
  const timerColor =
    timeLeft > 10 ? "text-emerald-600 bg-emerald-50 border-emerald-300" : timeLeft > 5 ? "text-amber-600 bg-slate-50 border-slate-300" : "text-rose-600 bg-rose-50 border-rose-300 animate-pulse";

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <GameHeader
        title="Matemática Divertida"
        emoji="🔢"
        onBack={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          onBack();
        }}
        progress={currentIndex + 1}
        total={questions.length}
        score={correctCount}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <Hearts lives={lives} maxLives={MAX_LIVES} />
          <div className={`flex items-center gap-1.5 font-['Fredoka'] font-bold text-lg px-3.5 py-1 rounded-lg border-2 ${timerColor}`}>
            <Timer className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Dica de bolinhas após o 1º erro */}
        {lives < MAX_LIVES && lives > 0 && !revealing && (
          <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] p-3 rounded-lg my-3 text-center">
            <div className="font-['Fredoka'] text-sm font-bold text-[#D97706] mb-2">
              💡 DICA — CONTE OS PONTOS:
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-wrap gap-1 max-w-[140px] justify-center">
                {Array.from({ length: Math.min(15, currentQ.a) }).map((_, i) => (
                  <span key={i} className="w-4 h-4 rounded-full bg-blue-500 shadow-xs inline-block" />
                ))}
              </div>
              <span className="font-bold text-lg text-gray-500">{currentQ.op}</span>
              <div className="flex flex-wrap gap-1 max-w-[140px] justify-center">
                {Array.from({ length: Math.min(15, currentQ.b) }).map((_, i) => (
                  <span key={i} className="w-4 h-4 rounded-full bg-pink-500 shadow-xs inline-block" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card da Equação */}
        <div className="flex flex-col items-center justify-center my-6">
          <div
            className={`px-8 sm:px-12 py-6 rounded-lg border-4 shadow-sm flex items-center gap-4 sm:gap-6 font-['Fredoka'] text-4xl sm:text-5xl font-extrabold ${
              isAddition
                ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                : "bg-rose-50 border-rose-400 text-rose-950"
            }`}
          >
            <span>{currentQ.a}</span>
            <span className={isAddition ? "text-emerald-600" : "text-rose-600"}>
              {currentQ.op}
            </span>
            <span>{currentQ.b}</span>
            <span className="text-gray-400">=</span>
            <span className="text-amber-500">?</span>

            {student.audioEnabled && (
              <button
                onClick={() => speakMath(currentQ.a, currentQ.op, currentQ.b)}
                className="ml-2 bg-slate-500 hover:bg-amber-600 text-white p-2.5 rounded-full shadow-sm active:scale-90 transition-all text-sm font-normal"
                title="Ouvir conta"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Opções de Múltipla Escolha */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-6">
          {currentQ.options.map((option, idx) => {
            const isCorrect = option === currentQ.answer;
            const isSelectedCorrect = selectedCorrect === option;
            const isDisabled = disabledOptions.includes(option);
            const isRevealedCorrect = revealing && isCorrect;

            let btnStyle = "bg-white hover:bg-slate-50 border-slate-300 text-slate-900";
            if (isSelectedCorrect || isRevealedCorrect) {
              btnStyle = "bg-emerald-500 border-emerald-600 text-white scale-105 shadow-sm";
            } else if (isDisabled) {
              btnStyle = "bg-rose-100 border-rose-300 text-rose-400 opacity-60 cursor-not-allowed line-through";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isDisabled || revealing || selectedCorrect !== null}
                className={`py-5 rounded-lg font-['Fredoka'] text-3xl font-extrabold border-2 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${btnStyle}`}
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
