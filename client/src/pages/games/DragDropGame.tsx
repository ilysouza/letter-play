import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult, Hearts, HintBox } from "@/components/GameShared";
import { getDailyDragWords, DragWordItem, shuffle, ALL_DRAG_WORDS } from "@/dailyWords";
import { updateStudentScore, getStudentRound } from "@/store";
import { speak } from "@/audio";
import { Volume2 } from "lucide-react";

interface Props {
  student: Student;
  onBack: () => void;
}

const MAX_LIVES = 2;

export default function DragDropGame({ student, onBack }: Props) {
  const [words, setWords] = useState<DragWordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [placedSyllables, setPlacedSyllables] = useState<(string | null)[]>([]);
  const [availableTiles, setAvailableTiles] = useState<{ id: string; text: string }[]>([]);
  const [wrongSlotIdx, setWrongSlotIdx] = useState<number | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Refs para evitar stale closure em timeouts
  const correctCountRef = useRef(0);
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const list = getDailyDragWords(getStudentRound(student.id, "drag-drop", Math.ceil(ALL_DRAG_WORDS.length / 5)));
    setWords(list);
    initWord(list[0], 0, list);
  }, []);

  const currentWord = words[currentIndex];

  const initWord = (item: DragWordItem, idx: number, pool = words) => {
    if (!item) return;
    currentIndexRef.current = idx;
    setLives(MAX_LIVES);
    setSelectedTile(null);
    setWrongSlotIdx(null);
    setRevealing(false);
    isTransitioningRef.current = false;
    setPlacedSyllables(new Array(item.syllables.length).fill(null));

    // Coletar distratores de outras palavras da sessão
    const otherWords = pool.filter((w) => w.word !== item.word);
    const otherSyllables: string[] = [];
    otherWords.forEach((w) => {
      w.syllables.forEach((s) => {
        if (!item.syllables.includes(s) && !otherSyllables.includes(s)) {
          otherSyllables.push(s);
        }
      });
    });

    const distractors = shuffle(otherSyllables).slice(0, 2);
    const combined = [...item.syllables, ...distractors];
    const tiles = shuffle(combined).map((text, i) => ({
      id: `${text}-${i}-${Math.random()}`,
      text,
    }));
    setAvailableTiles(tiles);

    if (student.audioEnabled) {
      speak(item.word);
    }
  };

  const handleTileClick = (tileId: string) => {
    if (revealing || isTransitioningRef.current) return;
    setSelectedTile((prev) => (prev === tileId ? null : tileId));
  };

  const handleSlotClick = (slotIdx: number) => {
    if (revealing || isTransitioningRef.current || !selectedTile || !currentWord) return;

    // Se já está preenchido, ignora
    if (placedSyllables[slotIdx] !== null) return;

    const tileObj = availableTiles.find((t) => t.id === selectedTile);
    if (!tileObj) return;

    const expected = currentWord.syllables[slotIdx];

    if (tileObj.text === expected) {
      // Acerto no slot
      const nextPlaced = [...placedSyllables];
      nextPlaced[slotIdx] = tileObj.text;
      setPlacedSyllables(nextPlaced);
      setAvailableTiles((prev) => prev.filter((t) => t.id !== selectedTile));
      setSelectedTile(null);

      // Checa se completou a palavra
      const allDone = nextPlaced.every((s, i) => s === currentWord.syllables[i]);
      if (allDone) {
        isTransitioningRef.current = true;
        correctCountRef.current += 1;
        setCorrectCount(correctCountRef.current);

        setTimeout(() => {
          advanceToNextWord();
        }, 500);
      }
    } else {
      // Erro no slot
      setWrongSlotIdx(slotIdx);
      const nextLives = lives - 1;
      setLives(nextLives);
      setSelectedTile(null);

      setTimeout(() => {
        setWrongSlotIdx(null);
      }, 650);

      if (nextLives <= 0) {
        // 0 vidas: revela resposta correta
        setRevealing(true);
        isTransitioningRef.current = true;
        setPlacedSyllables([...currentWord.syllables]);

        setTimeout(() => {
          advanceToNextWord();
        }, 1700);
      }
    }
  };

  const advanceToNextWord = () => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < words.length) {
      setCurrentIndex(nextIdx);
      initWord(words[nextIdx], nextIdx);
    } else {
      // Fim de jogo
      const finalScore = Math.round((correctCountRef.current / words.length) * 100);
      const finalXP = correctCountRef.current * 15;
      updateStudentScore(student.id, "drag-drop", finalScore, finalXP);
      setFinished(true);
    }
  };

  if (!currentWord) {
    return <div className="p-8 text-center text-xl font-bold">Carregando brincadeira...</div>;
  }

  if (finished) {
    const finalScore = Math.round((correctCount / words.length) * 100);
    return (
      <GameResult
        score={finalScore}
        total={words.length}
        correct={correctCount}
        xpEarned={correctCount * 15}
        onBack={onBack}
      />
    );
  }

  // Descobrir primeiro slot vazio para dica
  const nextEmptySlot = placedSyllables.findIndex((s) => s === null);
  const hintText =
    nextEmptySlot !== -1
      ? `a ${nextEmptySlot + 1}ª sílaba começa com "${currentWord.syllables[nextEmptySlot][0]}" — a palavra tem ${currentWord.syllables.length} sílabas!`
      : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <GameHeader
        title="Forme a Palavra"
        emoji="🔤"
        onBack={onBack}
        progress={currentIndex + 1}
        total={words.length}
        score={correctCount}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        <Hearts lives={lives} maxLives={MAX_LIVES} />

        {/* Dica visual inteligente */}
        {lives < MAX_LIVES && lives > 0 && !revealing && <HintBox hint={hintText} />}

        {/* Card da palavra e imagem */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative group">
            <img
              src={currentWord.image}
              alt={currentWord.word}
              className="w-40 h-40 sm:w-44 sm:h-44 object-cover rounded-lg border-4 border-slate-300 shadow-sm transition-transform hover:scale-105"
            />
            {student.audioEnabled && (
              <button
                onClick={() => speak(currentWord.word)}
                className="absolute bottom-2 right-2 bg-slate-500 hover:bg-amber-600 text-white p-2.5 rounded-full shadow-sm active:scale-90 transition-all"
                title="Ouvir palavra"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {revealing && (
            <div className="mt-3 font-['Fredoka'] text-amber-700 bg-amber-100 px-4 py-1.5 rounded-lg text-base font-bold animate-pulse">
              RESPOSTA CORRETA: {currentWord.word}
            </div>
          )}
        </div>

        {/* Slots das sílabas */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-6">
          {currentWord.syllables.map((_, idx) => {
            const placed = placedSyllables[idx];
            const isWrong = wrongSlotIdx === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSlotClick(idx)}
                disabled={revealing || placed !== null}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg font-['Fredoka'] text-2xl sm:text-3xl font-bold flex items-center justify-center border transition-all ${
                  placed
                    ? "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm"
                    : isWrong
                    ? "bg-rose-100 border-rose-500 text-rose-700 animate-shake"
                    : selectedTile
                    ? "bg-slate-50 border-amber-400 border-dashed hover:bg-amber-100 cursor-pointer animate-pulse"
                    : "bg-gray-50 border-gray-300 border-dashed"
                }`}
              >
                {isWrong ? "✗" : placed || ""}
              </button>
            );
          })}
        </div>

        {/* Pool de sílabas disponíveis */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
          <p className="text-center font-bold text-slate-800 text-sm mb-3">
            Toque na sílaba e depois no quadrinho certo:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {availableTiles.map((tile) => {
              const isSelected = selectedTile === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.id)}
                  disabled={revealing}
                  className={`px-5 py-3 rounded-lg font-['Fredoka'] text-2xl font-bold border-2 transition-all shadow-sm active:scale-95 ${
                    isSelected
                      ? "bg-amber-400 border-amber-500 text-amber-950 scale-105 shadow-sm"
                      : "bg-white border-slate-300 text-slate-900 hover:bg-amber-100"
                  }`}
                >
                  {tile.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
