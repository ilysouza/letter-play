import React from "react";
import { ArrowLeft, Sparkles, Trophy, Heart } from "lucide-react";
import { getLevelInfo } from "@/store";

interface GameHeaderProps {
  title: string;
  emoji?: string;
  onBack: () => void;
  progress: number;
  total: number;
  score: number;
}

export function GameHeader({ title, emoji, onBack, progress, total, score }: GameHeaderProps) {
  const pct = Math.min(100, Math.round((progress / Math.max(1, total)) * 100));

  return (
    <header className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-3xl shadow-sm border-2 border-amber-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl font-bold text-sm transition-all active:scale-95 border border-amber-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2.5">
          {emoji && <span className="text-2xl">{emoji}</span>}
          <h1 className="font-['Fredoka'] text-xl sm:text-2xl font-bold text-[#3D3580] tracking-wide">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-extrabold px-4 py-1.5 rounded-2xl text-sm shadow-sm">
          <span>⭐</span>
          <span>
            {score} / {total}
          </span>
        </div>
      </div>

      {/* Barra de progresso vibrante */}
      <div className="w-full bg-amber-100/70 h-3.5 rounded-full mt-3 overflow-hidden p-0.5 border border-amber-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] via-[#F59E0B] to-[#4ECDC4] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  );
}

interface HeartsProps {
  lives: number;
  maxLives?: number;
}

export function Hearts({ lives, maxLives = 2 }: HeartsProps) {
  return (
    <div className="flex items-center justify-center gap-2 my-2">
      {Array.from({ length: maxLives }).map((_, i) => {
        const isAlive = i < lives;
        return (
          <div
            key={i}
            className={`transition-all duration-300 transform ${
              isAlive ? "scale-100 text-rose-500 drop-shadow-sm" : "scale-75 text-gray-300 opacity-40"
            }`}
          >
            <Heart className={`w-8 h-8 ${isAlive ? "fill-rose-500 stroke-rose-600" : "fill-gray-200 stroke-gray-300"}`} />
          </div>
        );
      })}
    </div>
  );
}

interface HintBoxProps {
  hint: string;
}

export function HintBox({ hint }: HintBoxProps) {
  return (
    <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] text-[#B45309] px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 max-w-lg mx-auto my-3 shadow-xs animate-in fade-in duration-300">
      <span className="text-xl">💡</span>
      <p className="font-['Fredoka'] text-sm sm:text-base font-semibold tracking-wide">
        DICA: <span className="font-bold text-[#D97706]">{hint}</span>
      </p>
    </div>
  );
}

interface GameResultProps {
  score: number; // 0-100
  total: number;
  correct: number;
  onBack: () => void;
  xpEarned?: number;
}

export function GameResult({ score, total, correct, onBack, xpEarned }: GameResultProps) {
  const level = getLevelInfo(score);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border-4 border-amber-200 shadow-xl relative overflow-hidden">
        {/* Confetes decorativos sutis */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-pink-400 via-amber-400 to-teal-400" />

        <div className="w-24 h-24 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-inner">
          <span className="text-5xl animate-bounce">{level.emoji}</span>
        </div>

        <h2 className="font-['Fredoka'] text-3xl font-bold text-[#3D3580] mb-2">
          {score >= 80 ? "Sensacional!" : score >= 50 ? "Muito Bem!" : "Bom Esforço!"}
        </h2>

        <p className="text-gray-600 text-base mb-6 font-medium">
          {score >= 80
            ? "Você brilhou muito nesta atividade!"
            : score >= 50
            ? "Você está aprendendo cada vez mais rápido!"
            : "Continue praticando, você vai longe!"}
        </p>

        {/* Box de métricas */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 mb-6 flex justify-around items-center">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">Acertos</div>
            <div className="font-['Fredoka'] text-2xl font-extrabold text-[#3D3580]">
              {correct} / {total}
            </div>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase">Pontuação</div>
            <div className="font-['Fredoka'] text-2xl font-extrabold text-teal-600">
              {score}%
            </div>
          </div>
          {xpEarned !== undefined && (
            <>
              <div className="h-8 w-px bg-amber-200" />
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">XP Ganho</div>
                <div className="font-['Fredoka'] text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                  <span>+{xpEarned}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mb-6 inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Nível: {level.label} {level.emoji}
        </div>

        <div>
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-['Fredoka'] font-bold text-lg rounded-2xl shadow-md transition-all active:scale-95"
          >
            Voltar aos Jogos
          </button>
        </div>
      </div>
    </div>
  );
}
