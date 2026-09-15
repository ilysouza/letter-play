import React, { useState, useEffect } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult } from "@/components/GameShared";
import { getDailyImagePairs, getSpellingDistractors, shuffle, ImagePair } from "@/content/wordBank";
import { updateStudentScore, getStudentRound } from "@/store";
import { Check, X } from "lucide-react";

interface Props {
  student: Student;
  onBack: () => void;
}

export default function ImageWordGame({ student, onBack }: Props) {
  const [pairs, setPairs] = useState<ImagePair[]>([]);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  // Mapa de imageIdx -> palavra associada
  const [connections, setConnections] = useState<Record<number, string>>({});
  const [revealing, setRevealing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const list = getDailyImagePairs(getStudentRound(student.id, "image-word", 5));
    setPairs(list);

    const correctWords = list.map((p) => p.word);
    const distractors = getSpellingDistractors(correctWords);
    const combined = shuffle([...correctWords, ...distractors]);
    setWordOptions(combined);
  }, []);

  const handleImageClick = (idx: number) => {
    if (revealing) return;
    setSelectedImageIdx((prev) => (prev === idx ? null : idx));
  };

  const handleWordClick = (word: string) => {
    if (revealing || selectedImageIdx === null) return;

    // Cada palavra só pode ser ligada a uma imagem. Isso evita que
    // a mesma opção seja usada duas vezes e mascara associações erradas.
    const alreadyUsedElsewhere = Object.entries(connections).some(
      ([idx, currentWord]) => idx !== String(selectedImageIdx) && currentWord === word
    );
    if (alreadyUsedElsewhere) {
      setSelectedImageIdx(null);
      return;
    }

    // Conectar a imagem selecionada à palavra clicada
    setConnections((prev) => ({
      ...prev,
      [selectedImageIdx]: word,
    }));
    setSelectedImageIdx(null);
  };

  const allConnected = pairs.length > 0 && pairs.every((_, idx) => !!connections[idx]);

  const handleVerify = () => {
    if (!allConnected || revealing) return;
    setRevealing(true);

    const result: Record<number, boolean> = {};
    let correctCount = 0;

    pairs.forEach((pair, idx) => {
      const isRight = connections[idx] === pair.word;
      result[idx] = isRight;
      if (isRight) correctCount++;
    });

    setVerificationResult(result);

    const score = Math.round((correctCount / pairs.length) * 100);
    const xp = correctCount * 15;
    setFinalScore(score);

    updateStudentScore(student.id, "image-word", score, xp);

    setTimeout(() => {
      setFinished(true);
    }, 2200);
  };

  if (pairs.length === 0) {
    return <div className="p-8 text-center text-xl font-bold">Carregando imagens...</div>;
  }

  if (finished) {
    const correctCount = Object.values(verificationResult).filter(Boolean).length;
    return (
      <GameResult
        score={finalScore}
        total={pairs.length}
        correct={correctCount}
        xpEarned={correctCount * 15}
        onBack={onBack}
      />
    );
  }

  const assignedWords = Object.values(connections);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <GameHeader
        title="Imagem e Palavra"
        emoji="🖼️"
        onBack={onBack}
        progress={Object.keys(connections).length}
        total={pairs.length}
        score={Object.keys(connections).length}
      />

      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm">
        <p className="text-center font-bold text-gray-600 text-sm mb-6">
          1. Toque em uma imagem para selecioná-la (ficará com borda destacada)
          <br />
          2. Toque na palavra com a grafia correta para ligar
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Coluna das 4 Imagens */}
          <div className="flex flex-col gap-4">
            <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 text-center">
              Imagens
            </h3>
            {pairs.map((pair, idx) => {
              const isSelected = selectedImageIdx === idx;
              const connectedWord = connections[idx];
              const isVerified = revealing && verificationResult[idx] !== undefined;
              const isCorrect = isVerified && verificationResult[idx];

              let borderClass = "border-slate-200 hover:border-amber-400";
              if (isSelected) borderClass = "border-rose-500 ring-4 ring-rose-200 scale-102";
              if (isVerified) {
                borderClass = isCorrect ? "border-emerald-500 ring-4 ring-emerald-200" : "border-rose-500 ring-4 ring-rose-200";
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleImageClick(idx)}
                  className={`flex items-center gap-4 p-3 bg-slate-50/50 rounded-lg border transition-all cursor-pointer ${borderClass}`}
                >
                  <img
                    src={pair.image}
                    alt="Item"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-500 uppercase">Ligado a:</div>
                    <div className="font-['Fredoka'] text-xl font-bold text-slate-900 mt-1">
                      {connectedWord ? (
                        <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs inline-block">
                          {connectedWord}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm font-normal italic">
                          (Nenhuma palavra selecionada)
                        </span>
                      )}
                    </div>
                  </div>
                  {isVerified && (
                    <div className="text-2xl">
                      {isCorrect ? <Check className="w-8 h-8 text-emerald-600" /> : <X className="w-8 h-8 text-rose-600" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Coluna das Palavras (4 corretas + 4 distratores) */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 text-center">
              Palavras Disponíveis
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {wordOptions.map((word, idx) => {
                const isAssigned = assignedWords.includes(word);
                // Se estamos revelando e a palavra não foi associada a nada
                const isUnusedDistractor = revealing && !isAssigned;

                let style = "bg-white border-slate-300 text-slate-900 hover:bg-amber-100";
                if (isAssigned) {
                  style = "bg-amber-100 border-amber-400 text-slate-800 font-extrabold shadow-xs";
                }
                if (isUnusedDistractor) {
                  style = "bg-rose-50 border-rose-200 text-rose-400 opacity-60";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleWordClick(word)}
                    disabled={revealing}
                    className={`py-3.5 px-3 rounded-lg font-['Fredoka'] text-lg sm:text-xl font-bold border-2 transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 ${style}`}
                  >
                    <span>{word}</span>
                    {isUnusedDistractor && <span className="text-rose-500 text-sm">✗</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão Verificar */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleVerify}
            disabled={!allConnected || revealing}
            className={`px-8 py-3.5 rounded-lg font-['Fredoka'] font-bold text-lg transition-all shadow-sm active:scale-95 ${
              allConnected && !revealing
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
            }`}
          >
            {revealing ? "Verificando..." : "Verificar Respostas"}
          </button>
        </div>
      </div>
    </div>
  );
}
