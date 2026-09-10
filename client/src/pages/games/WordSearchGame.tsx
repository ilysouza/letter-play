import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult } from "@/components/GameShared";
import { getDailySearchPuzzle, SearchPuzzle } from "@/dailyWords";
import { updateStudentScore } from "@/store";
import { Check, CheckCircle2 } from "lucide-react";

interface Props {
  student: Student;
  onBack: () => void;
}

const PALETTE = [
  { bg: "bg-emerald-400", border: "border-emerald-500", text: "text-white" },
  { bg: "bg-blue-400", border: "border-blue-500", text: "text-white" },
  { bg: "bg-purple-400", border: "border-purple-500", text: "text-white" },
  { bg: "bg-pink-400", border: "border-pink-500", text: "text-white" },
  { bg: "bg-amber-400", border: "border-amber-500", text: "text-amber-950" },
  { bg: "bg-teal-400", border: "border-teal-500", text: "text-white" },
];

export default function WordSearchGame({ student, onBack }: Props) {
  const [puzzle, setPuzzle] = useState<SearchPuzzle | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [wordColors, setWordColors] = useState<Record<string, number>>({});
  // Mapa de "r-c" -> lista de índices de cor
  const [cellHighlights, setCellHighlights] = useState<Record<string, number>>({});

  // Seleção atual por arraste
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{ r: number; c: number } | null>(null);
  const [currentSelected, setCurrentSelected] = useState<{ r: number; c: number }[]>([]);
  const [flashWrong, setFlashWrong] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setPuzzle(getDailySearchPuzzle());
  }, []);

  // Calcula linha reta (H, V ou Diagonal 45°)
  const getLineCells = (
    start: { r: number; c: number },
    end: { r: number; c: number }
  ): { r: number; c: number }[] => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    // Deve ser mesma linha, mesma coluna ou diagonal 45°
    if (dr === 0) {
      // Horizontal
      const step = dc > 0 ? 1 : -1;
      const cells = [];
      for (let c = start.c; c !== end.c + step; c += step) {
        cells.push({ r: start.r, c });
      }
      return cells;
    } else if (dc === 0) {
      // Vertical
      const step = dr > 0 ? 1 : -1;
      const cells = [];
      for (let r = start.r; r !== end.r + step; r += step) {
        cells.push({ r, c: start.c });
      }
      return cells;
    } else if (absDr === absDc) {
      // Diagonal
      const stepR = dr > 0 ? 1 : -1;
      const stepC = dc > 0 ? 1 : -1;
      const cells = [];
      for (let i = 0; i <= absDr; i++) {
        cells.push({ r: start.r + i * stepR, c: start.c + i * stepC });
      }
      return cells;
    }

    // Se não for linha reta perfeita, retorna apenas o ponto de início
    return [start];
  };

  const handlePointerDown = (r: number, c: number) => {
    setIsSelecting(true);
    setStartCell({ r, c });
    setCurrentSelected([{ r, c }]);
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (!isSelecting || !startCell) return;
    const line = getLineCells(startCell, { r, c });
    setCurrentSelected(line);
  };

  const handlePointerUp = () => {
    if (!isSelecting || !puzzle) {
      setIsSelecting(false);
      return;
    }
    setIsSelecting(false);

    // Extrair palavra formada
    const wordForward = currentSelected.map((pos) => puzzle.grid[pos.r][pos.c]).join("");
    const wordBackward = currentSelected
      .slice()
      .reverse()
      .map((pos) => puzzle.grid[pos.r][pos.c])
      .join("");

    const targetList = puzzle.words.map((w) => w.word);
    let matchedWord: string | null = null;

    if (targetList.includes(wordForward) && !foundWords.includes(wordForward)) {
      matchedWord = wordForward;
    } else if (targetList.includes(wordBackward) && !foundWords.includes(wordBackward)) {
      matchedWord = wordBackward;
    }

    if (matchedWord) {
      // Palavra encontrada!
      const nextFound = [...foundWords, matchedWord];
      const colorIdx = foundWords.length % PALETTE.length;
      setFoundWords(nextFound);
      setWordColors((prev) => ({ ...prev, [matchedWord!]: colorIdx }));

      const nextHighlights = { ...cellHighlights };
      currentSelected.forEach((pos) => {
        nextHighlights[`${pos.r}-${pos.c}`] = colorIdx;
      });
      setCellHighlights(nextHighlights);

      if (nextFound.length === puzzle.words.length) {
        // Encontrou todas as 6 palavras!
        setTimeout(() => {
          finalizeGame(6);
        }, 800);
      }
    } else {
      // Erro: flash vermelho
      setFlashWrong(true);
      setTimeout(() => {
        setFlashWrong(false);
      }, 350);
    }

    setCurrentSelected([]);
    setStartCell(null);
  };

  const finalizeGame = (foundCountOverride?: number) => {
    if (!puzzle) return;
    const count = foundCountOverride !== undefined ? foundCountOverride : foundWords.length;
    const score = count === 6 ? 100 : Math.round((count / 6) * 100);
    const xp = count * 10;
    updateStudentScore(student.id, "word-search", score, xp);
    setFinished(true);
  };

  if (!puzzle) {
    return <div className="p-8 text-center text-xl font-bold">Criando caça-palavras...</div>;
  }

  if (finished) {
    const score = foundWords.length === 6 ? 100 : Math.round((foundWords.length / 6) * 100);
    return (
      <GameResult
        score={score}
        total={6}
        correct={foundWords.length}
        xpEarned={foundWords.length * 10}
        onBack={onBack}
      />
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-4 select-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <GameHeader
        title="Caça-Palavras"
        emoji="🔍"
        onBack={onBack}
        progress={foundWords.length}
        total={puzzle.words.length}
        score={foundWords.length}
      />

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border-3 border-amber-200 shadow-md">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
          {/* Grid 10x10 de Letras */}
          <div
            className={`p-3 sm:p-4 rounded-3xl bg-amber-50/60 border-2 transition-all ${
              flashWrong ? "border-rose-400 bg-rose-50" : "border-amber-200"
            }`}
          >
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 touch-none">
              {puzzle.grid.map((row, r) =>
                row.map((letter, c) => {
                  const isSelected = currentSelected.some((pos) => pos.r === r && pos.c === c);
                  const highlightColorIdx = cellHighlights[`${r}-${c}`];
                  const hasFoundColor = highlightColorIdx !== undefined;

                  let cellStyle = "bg-white text-gray-800 border-amber-200 hover:bg-amber-100";

                  if (isSelected) {
                    cellStyle = "bg-amber-400 text-amber-950 font-black scale-105 border-amber-500 shadow-xs";
                  } else if (hasFoundColor) {
                    const pal = PALETTE[highlightColorIdx];
                    cellStyle = `${pal.bg} ${pal.text} font-black border-transparent shadow-xs`;
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      onPointerDown={() => handlePointerDown(r, c)}
                      onPointerEnter={() => handlePointerEnter(r, c)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl font-['Fredoka'] text-sm sm:text-base md:text-lg flex items-center justify-center border transition-all cursor-pointer select-none ${cellStyle}`}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Lista Lateral de Palavras com imagens */}
          <div className="w-full lg:w-72 flex flex-col gap-2.5">
            <div className="text-sm font-bold text-amber-900 mb-1 flex items-center justify-between">
              <span>Palavras a encontrar:</span>
              <span className="font-['Fredoka'] text-base text-teal-600">
                {foundWords.length}/6
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {puzzle.words.map((item, idx) => {
                const isFound = foundWords.includes(item.word);
                const colorIdx = wordColors[item.word];
                const pal = colorIdx !== undefined ? PALETTE[colorIdx] : null;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border-2 transition-all ${
                      isFound && pal
                        ? `${pal.bg} ${pal.text} ${pal.border} opacity-95 scale-98 shadow-xs`
                        : "bg-amber-50/50 border-amber-200 text-gray-700"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.word}
                      className="w-9 h-9 object-cover rounded-xl border border-amber-300"
                    />
                    <span className="font-['Fredoka'] font-bold text-base flex-1">
                      {item.word}
                    </span>
                    {isFound && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-amber-200">
              <button
                onClick={() => finalizeGame()}
                className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl border border-amber-300 transition-all active:scale-95 text-sm"
              >
                Finalizar Desafio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
