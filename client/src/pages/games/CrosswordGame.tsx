import React, { useState, useEffect, useRef } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult } from "@/components/GameShared";
import { getDailyCrossword, CrosswordPuzzle } from "@/content/wordBank";
import { updateStudentScore, getStudentRound } from "@/store";

interface Props {
  student: Student;
  onBack: () => void;
}

export default function CrosswordGame({ student, onBack }: Props) {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  // Matriz de letras digitadas pelo aluno
  const [gridValues, setGridValues] = useState<string[][]>([]);
  const [revealing, setRevealing] = useState(false);
  const [verificationGrid, setVerificationGrid] = useState<boolean[][]>([]);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Mapa de referências para inputs "r-c" -> HTMLInputElement
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    const p = getDailyCrossword(getStudentRound(student.id, "crossword", 4));
    setPuzzle(p);

    const initial = Array.from({ length: p.gridSize }, () =>
      Array.from({ length: p.gridSize }, () => "")
    );
    setGridValues(initial);
  }, []);

  if (!puzzle) {
    return <div className="p-8 text-center text-xl font-bold">Carregando cruzadinha...</div>;
  }

  // Obter lista ordenada de células ativas (não nulas no puzzle) para navegação fluida
  const getActiveCells = () => {
    const list: { r: number; c: number }[] = [];
    for (let r = 0; r < puzzle.gridSize; r++) {
      for (let c = 0; c < puzzle.gridSize; c++) {
        if (puzzle.answer[r][c] !== null) {
          list.push({ r, c });
        }
      }
    }
    return list;
  };

  const activeCells = getActiveCells();

  const handleInputChange = (r: number, c: number, value: string) => {
    if (revealing) return;

    const val = value.slice(-1).toUpperCase(); // Apenas a última letra digitada
    const nextGrid = gridValues.map((row) => [...row]);
    nextGrid[r][c] = val;
    setGridValues(nextGrid);

    if (val) {
      // Auto-foco para a próxima célula ativa
      const currentIdx = activeCells.findIndex((cell) => cell.r === r && cell.c === c);
      if (currentIdx !== -1 && currentIdx < activeCells.length - 1) {
        const nextCell = activeCells[currentIdx + 1];
        const nextInput = inputRefs.current.get(`${nextCell.r}-${nextCell.c}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !gridValues[r][c]) {
      // Se a célula está vazia e aperta Backspace, volta para a célula anterior
      const currentIdx = activeCells.findIndex((cell) => cell.r === r && cell.c === c);
      if (currentIdx > 0) {
        const prevCell = activeCells[currentIdx - 1];
        const prevInput = inputRefs.current.get(`${prevCell.r}-${prevCell.c}`);
        prevInput?.focus();
      }
    }
  };

  // Verifica se todas as células ativas foram preenchidas
  const isAllFilled = activeCells.every((cell) => !!gridValues[cell.r]?.[cell.c]);

  const handleVerify = () => {
    if (!isAllFilled || revealing) return;
    setRevealing(true);

    const verified = Array.from({ length: puzzle.gridSize }, () =>
      Array.from({ length: puzzle.gridSize }, () => false)
    );

    let correctCount = 0;
    const totalLetters = activeCells.length;

    activeCells.forEach((cell) => {
      const isRight =
        gridValues[cell.r][cell.c].toUpperCase() === puzzle.answer[cell.r][cell.c]?.toUpperCase();
      verified[cell.r][cell.c] = isRight;
      if (isRight) correctCount++;
    });

    setVerificationGrid(verified);

    const score = Math.round((correctCount / totalLetters) * 100);
    const xp = correctCount * 5;
    setFinalScore(score);

    updateStudentScore(student.id, "crossword", score, xp);

    setTimeout(() => {
      setFinished(true);
    }, 2500);
  };

  if (finished) {
    const correctCount = activeCells.filter(
      (cell) => gridValues[cell.r][cell.c].toUpperCase() === puzzle.answer[cell.r][cell.c]?.toUpperCase()
    ).length;

    return (
      <GameResult
        score={finalScore}
        total={activeCells.length}
        correct={correctCount}
        xpEarned={correctCount * 5}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <GameHeader
        title="Cruzadinha"
        emoji="✏️"
        onBack={onBack}
        progress={activeCells.filter((c) => !!gridValues[c.r]?.[c.c]).length}
        total={activeCells.length}
        score={activeCells.filter((c) => !!gridValues[c.r]?.[c.c]).length}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
          {/* Grid da Cruzadinha */}
          <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200 shadow-inner">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.answer.map((row, r) =>
                row.map((cellAnswer, c) => {
                  const isNull = cellAnswer === null;
                  const key = `${r}-${c}`;
                  const clueNum = puzzle.cellNumbers[key];
                  const letterValue = gridValues[r]?.[c] || "";
                  const isVerified = revealing && !isNull;
                  const isCorrect = isVerified && verificationGrid[r]?.[c];

                  if (isNull) {
                    return (
                      <div
                        key={key}
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-lg bg-amber-200/40 border border-slate-200/60"
                      />
                    );
                  }

                  let cellStyle = "bg-white border-slate-300 text-slate-900 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200";
                  if (isVerified) {
                    cellStyle = isCorrect
                      ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                      : "bg-rose-100 border-rose-500 text-rose-800";
                  }

                  return (
                    <div
                      key={key}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-lg border-2 transition-all flex items-center justify-center ${cellStyle}`}
                    >
                      {clueNum && (
                        <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-black text-amber-600 select-none">
                          {clueNum}
                        </span>
                      )}
                      <input
                        ref={(el) => {
                          if (el) inputRefs.current.set(key, el);
                          else inputRefs.current.delete(key);
                        }}
                        type="text"
                        maxLength={1}
                        value={letterValue}
                        disabled={revealing}
                        onChange={(e) => handleInputChange(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(r, c, e)}
                        className="w-full h-full text-center font-['Fredoka'] text-2xl sm:text-3xl font-bold bg-transparent outline-none uppercase"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Lista de Pistas */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 border-b pb-1 border-slate-200">
              Pistas do Desafio:
            </h3>
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {puzzle.clues.map((clue, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm leading-snug"
                >
                  <div className="font-['Fredoka'] font-bold text-slate-800 flex items-center justify-between mb-1">
                    <span>
                      {clue.num}. {clue.dir === "H" ? "Horizontal" : "Vertical"}
                    </span>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      {clue.word.length} letras
                    </span>
                  </div>
                  <p className="text-gray-700 text-xs sm:text-sm">{clue.clue}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={!isAllFilled || revealing}
              className={`w-full py-3.5 rounded-lg font-['Fredoka'] font-bold text-base transition-all shadow-sm active:scale-95 ${
                isAllFilled && !revealing
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white cursor-pointer"
                  : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
              }`}
            >
              {revealing ? "Verificando..." : "Verificar Cruzadinha"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
