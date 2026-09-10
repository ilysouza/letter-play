import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult, Hearts, HintBox } from "@/components/GameShared";
import { getDailyRaceWords, shuffle } from "@/dailyWords";
import { updateStudentScore } from "@/store";
import { speak } from "@/audio";
import { Timer, Volume2 } from "lucide-react";

interface Props {
  student: Student;
  onBack: () => void;
}

const MAX_LIVES = 2;
const TIME_PER_WORD = 25;

export default function WordRaceGame({ student, onBack }: Props) {
  const [words, setWords] = useState<{ word: string; image: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_WORD);
  const [currentSlots, setCurrentSlots] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ id: string; letter: string }[]>([]);
  const [flashWrong, setFlashWrong] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const correctCountRef = useRef(0);
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const list = getDailyRaceWords();
    setWords(list);
    initWord(list[0], 0);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentWordObj = words[currentIndex];

  const initWord = (item: { word: string; image: string }, idx: number) => {
    if (!item) return;
    currentIndexRef.current = idx;
    setLives(MAX_LIVES);
    setTimeLeft(TIME_PER_WORD);
    setCurrentSlots([]);
    setFlashWrong(false);
    isTransitioningRef.current = false;

    // Embaralhar letras da palavra com IDs únicos
    const letters = item.word.split("");
    const shuffled = shuffle(letters).map((l, i) => ({
      id: `${l}-${i}-${Math.random()}`,
      letter: l,
    }));
    setAvailableLetters(shuffled);

    if (student.audioEnabled) {
      speak(item.word);
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
    setTimeout(() => {
      advanceNext();
    }, 500);
  };

  const handleLetterClick = (item: { id: string; letter: string }) => {
    if (isTransitioningRef.current || !currentWordObj) return;

    const expectedIndex = currentSlots.length;
    const expectedLetter = currentWordObj.word[expectedIndex];

    if (item.letter === expectedLetter) {
      // Letra correta
      const nextSlots = [...currentSlots, item.letter];
      setCurrentSlots(nextSlots);
      setAvailableLetters((prev) => prev.filter((l) => l.id !== item.id));

      if (nextSlots.length === currentWordObj.word.length) {
        // Palavra completa!
        if (timerRef.current) clearInterval(timerRef.current);
        isTransitioningRef.current = true;
        correctCountRef.current += 1;
        setCorrectCount(correctCountRef.current);

        setTimeout(() => {
          advanceNext();
        }, 700);
      }
    } else {
      // Letra errada
      setFlashWrong(true);
      const nextLives = lives - 1;
      setLives(nextLives);

      setTimeout(() => {
        setFlashWrong(false);
      }, 350);

      if (nextLives <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        isTransitioningRef.current = true;
        setTimeout(() => {
          advanceNext();
        }, 800);
      }
    }
  };

  const advanceNext = () => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < words.length) {
      setCurrentIndex(nextIdx);
      initWord(words[nextIdx], nextIdx);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalScore = Math.round((correctCountRef.current / words.length) * 100);
      const finalXP = correctCountRef.current * 10;
      updateStudentScore(student.id, "word-race", finalScore, finalXP);
      setFinished(true);
    }
  };

  if (!currentWordObj) {
    return <div className="p-8 text-center text-xl font-bold">Preparando a corrida...</div>;
  }

  if (finished) {
    const finalScore = Math.round((correctCount / words.length) * 100);
    return (
      <GameResult
        score={finalScore}
        total={words.length}
        correct={correctCount}
        xpEarned={correctCount * 10}
        onBack={onBack}
      />
    );
  }

  const nextLetterIndex = currentSlots.length;
  const remainingLetters = currentWordObj.word.length - nextLetterIndex;
  const hintText =
    remainingLetters > 0
      ? `a próxima letra é "${currentWordObj.word[nextLetterIndex]}" — faltam ${remainingLetters} letra(s)!`
      : "";

  const timerColor =
    timeLeft > 15 ? "text-emerald-600 bg-emerald-50 border-emerald-300" : timeLeft > 8 ? "text-amber-600 bg-slate-50 border-slate-300" : "text-rose-600 bg-rose-50 border-rose-300 animate-pulse";

  return (
    <div className={`max-w-4xl mx-auto px-4 py-4 transition-colors duration-200 ${flashWrong ? "bg-rose-100/40 rounded-lg" : ""}`}>
      <GameHeader
        title="Corrida das Palavras"
        emoji="🏎️"
        onBack={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          onBack();
        }}
        progress={currentIndex + 1}
        total={words.length}
        score={correctCount}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        {/* Race Track / Barra de corrida */}
        <div className="relative mb-6 bg-amber-100/80 rounded-lg p-2.5 border border-slate-200">
          <div className="flex gap-1.5 h-3">
            {words.map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all ${
                  i < currentIndex ? "bg-emerald-400" : i === currentIndex ? "bg-amber-400" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          {/* Carro de corrida */}
          <div
            className="text-2xl transition-all duration-300 -mt-2 drop-shadow-sm"
            style={{
              transform: `translateX(${(currentIndex / Math.max(1, words.length - 1)) * 92}%)`,
            }}
          >
            🏎️
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Hearts lives={lives} maxLives={MAX_LIVES} />
          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-['Fredoka'] font-bold text-lg px-3.5 py-1 rounded-lg border-2 ${timerColor}`}>
            <Timer className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {lives < MAX_LIVES && lives > 0 && <HintBox hint={hintText} />}

        {/* Imagem da palavra */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative group">
            <img
              src={currentWordObj.image}
              alt="Ilustração"
              className="w-40 h-40 sm:w-44 sm:h-44 object-cover rounded-lg border-4 border-slate-300 shadow-sm"
            />
            {student.audioEnabled && (
              <button
                onClick={() => speak(currentWordObj.word)}
                className="absolute bottom-2 right-2 bg-slate-500 hover:bg-amber-600 text-white p-2.5 rounded-full shadow-sm active:scale-90 transition-all"
                title="Ouvir palavra"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Slots da resposta (esquerda para direita) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 my-6">
          {currentWordObj.word.split("").map((_, idx) => {
            const filledLetter = currentSlots[idx];
            return (
              <div
                key={idx}
                className={`w-14 h-16 sm:w-16 sm:h-20 rounded-lg font-['Fredoka'] text-3xl font-bold flex items-center justify-center border transition-all ${
                  filledLetter
                    ? "bg-emerald-100 border-emerald-400 text-emerald-800 scale-102"
                    : idx === currentSlots.length
                    ? "bg-slate-50 border-amber-400 border-dashed animate-pulse"
                    : "bg-gray-50 border-gray-200 border-dashed"
                }`}
              >
                {filledLetter || ""}
              </div>
            );
          })}
        </div>

        {/* Letras embaralhadas clicáveis */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <p className="text-center font-bold text-slate-800 text-sm mb-3">
            Toque nas letras na ordem certa bem rápido:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {availableLetters.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLetterClick(item)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg font-['Fredoka'] text-3xl font-bold bg-white hover:bg-amber-100 text-slate-900 border-2 border-slate-300 shadow-sm active:scale-90 transition-all flex items-center justify-center"
              >
                {item.letter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
