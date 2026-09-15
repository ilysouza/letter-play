import React from "react";
import { ArrowLeft, Heart } from "lucide-react";
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
    <header className="w-full max-w-4xl mx-auto mb-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex min-w-0 items-center gap-2">
          {emoji && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-100 to-indigo-100 text-lg shadow-sm transition-transform hover:rotate-6 hover:scale-110">{emoji}</span>}
          <h1 className="truncate font-title text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        <div className="text-sm font-bold text-slate-600 whitespace-nowrap">{score}/{total}</div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}

export function Hearts({ lives, maxLives = 2 }: { lives: number; maxLives?: number }) {
  return (
    <div className="flex items-center gap-1 text-sm text-slate-500" aria-label={`${lives} vidas restantes`}>
      <span className="mr-1 font-semibold">Vidas</span>
      {Array.from({ length: maxLives }).map((_, i) => (
        <Heart key={i} className={`h-4 w-4 ${i < lives ? "fill-rose-400 text-rose-400" : "text-slate-300"}`} />
      ))}
    </div>
  );
}

export function HintBox({ hint }: { hint: string }) {
  return (
    <div className="mx-auto my-3 max-w-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <span className="font-bold">Dica:</span> {hint}
    </div>
  );
}

interface GameResultProps {
  score: number;
  total: number;
  correct: number;
  onBack: () => void;
  xpEarned?: number;
}

export function GameResult({ score, total, correct, onBack, xpEarned }: GameResultProps) {
  const level = getLevelInfo(score);
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-5 text-4xl grayscale">{level.emoji}</div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Atividade concluída</p>
        <h2 className="font-title mb-2 text-3xl font-bold text-slate-900">
          {score >= 80 ? "Muito bem!" : score >= 50 ? "Bom trabalho!" : "Continue praticando"}
        </h2>
        <p className="mb-6 text-sm text-slate-500">Cada tentativa ajuda você a aprender um pouco mais.</p>
        <div className="mb-6 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-4">
          <div><div className="text-[11px] font-bold uppercase text-slate-400">Acertos</div><div className="font-title text-xl font-bold text-slate-900">{correct}/{total}</div></div>
          <div><div className="text-[11px] font-bold uppercase text-slate-400">Score</div><div className="font-title text-xl font-bold text-teal-600">{score}%</div></div>
          <div><div className="text-[11px] font-bold uppercase text-slate-400">XP</div><div className="font-title text-xl font-bold text-amber-600">+{xpEarned ?? 0}</div></div>
        </div>
        <p className="mb-6 text-sm text-slate-500">Nível: <strong className="text-slate-800">{level.label}</strong></p>
        <button onClick={onBack} className="w-full bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700 active:scale-[0.99]">Voltar aos jogos</button>
      </div>
    </div>
  );
}
