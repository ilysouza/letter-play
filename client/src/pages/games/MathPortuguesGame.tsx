import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult, Hearts } from "@/components/GameShared";
import { updateStudentScore } from "@/store";
import { speakMath } from "@/audio";
import { Volume2 } from "lucide-react";
import { NUMBERS_IN_WORDS, shuffle } from "@/content/wordBank";

interface Props {
  student: Student;
  onBack: () => void;
}

interface MathPortQuestion {
  a: number;
  op: "+" | "-";
  b: number;
  resultNum: number;
  resultWord: string;
  options: string[];
}

const TOTAL_QUESTIONS = 10;
const MAX_LIVES = 2;

export default function MathPortuguesGame({ student, onBack }: Props) {
  const [questions, setQuestions] = useState<MathPortQuestion[]>([]);
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
    // Gerar 10 questões proceduralmente com resultado sempre entre 1 e 12
    const list: MathPortQuestion[] = [];
    const allWords = Object.values(NUMBERS_IN_WORDS);

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const isAdd = Math.random() < 0.6;
      let a: number, b: number, resultNum: number;
      const op: "+" | "-" = isAdd ? "+" : "-";

      if (isAdd) {
        a = Math.floor(Math.random() * 6) + 1; // 1-6
        b = Math.floor(Math.random() * 6) + 1; // 1-6
        resultNum = a + b; // Máximo 12
      } else {
        a = Math.floor(Math.random() * 8) + 3; // 3-10
        b = Math.floor(Math.random() * (a - 1)) + 1; // Subtração positiva
        resultNum = a - b;
      }

      const resultWord = NUMBERS_IN_WORDS[resultNum];
      const otherWords = allWords.filter((w) => w !== resultWord);
      const distractors = shuffle(otherWords).slice(0, 3);
      const options = shuffle([resultWord, ...distractors]);

      list.push({
        a,
        op,
        b,
        resultNum,
        resultWord,
        options,
      });
    }

    setQuestions(list);
    initQuestion(list[0], 0);
  }, []);

  const currentQ = questions[currentIndex];

  const initQuestion = (q: MathPortQuestion, idx: number) => {
    if (!q) return;
    currentIndexRef.current = idx;
    setLives(MAX_LIVES);
    setDisabledOptions([]);
    setSelectedCorrect(null);
    setRevealing(false);
    isTransitioningRef.current = false;

    if (student.audioEnabled) {
      speakMath(q.a, q.op, q.b);
    }
  };

  const handleSelectOption = (word: string) => {
    if (revealing || isTransitioningRef.current || disabledOptions.includes(word) || !currentQ) return;

    if (word === currentQ.resultWord) {
      // Acerto
      isTransitioningRef.current = true;
      setSelectedCorrect(word);
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);

      setTimeout(() => {
        advanceNext();
      }, 950);
    } else {
      // Erro
      const nextDisabled = [...disabledOptions, word];
      setDisabledOptions(nextDisabled);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setRevealing(true);
        isTransitioningRef.current = true;
        setTimeout(() => {
          advanceNext();
        }, 1500);
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
      updateStudentScore(student.id, "math-portugues", finalScore, finalXP);
      setFinished(true);
    }
  };

  if (!currentQ) {
    return <div className="p-8 text-center text-xl font-bold">Carregando desafios...</div>;
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <GameHeader
        title="Conta e Escreve"
        emoji="🔢📝"
        onBack={onBack}
        progress={currentIndex + 1}
        total={questions.length}
        score={correctCount}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        <Hearts lives={lives} maxLives={MAX_LIVES} />

        {/* Dica do resultado em bolinhas laranjas após 1º erro */}
        {lives < MAX_LIVES && lives > 0 && !revealing && (
          <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] p-3 rounded-lg my-3 text-center animate-in fade-in">
            <div className="font-['Fredoka'] text-sm font-bold text-[#D97706] mb-2">
              💡 DICA — CONTE OS PONTOS DO RESULTADO:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm mx-auto">
              {Array.from({ length: currentQ.resultNum }).map((_, i) => (
                <span key={i} className="w-5 h-5 rounded-full bg-slate-500 shadow-xs inline-block" />
              ))}
            </div>
          </div>
        )}

        {/* Card da Equação com representação visual em bolinhas */}
        <div className="flex flex-col items-center justify-center my-6">
          <div
            className={`px-8 py-6 rounded-lg border-4 shadow-sm flex flex-col items-center gap-3 ${
              isAddition ? "bg-emerald-50 border-emerald-400" : "bg-purple-50 border-purple-400"
            }`}
          >
            <div className="flex items-center gap-4 sm:gap-6 font-['Fredoka'] text-4xl sm:text-5xl font-extrabold text-slate-900">
              <span>{currentQ.a}</span>
              <span className={isAddition ? "text-emerald-600" : "text-purple-600"}>
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

            {/* Representação visual base com bolinhas azuis para A e rosas para B */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200/60 w-full justify-center">
              <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
                {Array.from({ length: currentQ.a }).map((_, i) => (
                  <span key={i} className="w-4 h-4 rounded-full bg-blue-500 inline-block shadow-xs" />
                ))}
              </div>
              <span className="font-bold text-gray-400">{currentQ.op}</span>
              <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
                {Array.from({ length: currentQ.b }).map((_, i) => (
                  <span key={i} className="w-4 h-4 rounded-full bg-pink-500 inline-block shadow-xs" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grade de Palavras por Extenso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto my-6">
          {currentQ.options.map((optionWord, idx) => {
            const isCorrect = optionWord === currentQ.resultWord;
            const isSelectedCorrect = selectedCorrect === optionWord;
            const isDisabled = disabledOptions.includes(optionWord);
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
                onClick={() => handleSelectOption(optionWord)}
                disabled={isDisabled || revealing || selectedCorrect !== null}
                className={`py-4 px-6 rounded-lg font-['Fredoka'] text-2xl font-bold border-2 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{optionWord}</span>
                {(isSelectedCorrect || isRevealedCorrect) && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
