import React from "react";
import { Student, Screen } from "@/types";
import { GAME_LABELS } from "@/dailyWords";
import { getStudentAvgScore, getLevelInfo } from "@/store";
import { LogOut, ArrowUpRight } from "lucide-react";

interface Props { student: Student; onSelectGame: (screen: Screen) => void; onLogout: () => void; }
const GAME_KEYS: { key: string; screen: Screen }[] = [
  { key: "drag-drop", screen: "game-drag-drop" }, { key: "spelling-quiz", screen: "game-spelling-quiz" },
  { key: "word-race", screen: "game-word-race" }, { key: "word-search", screen: "game-word-search" },
  { key: "image-word", screen: "game-image-word" }, { key: "crossword", screen: "game-crossword" },
  { key: "math", screen: "game-math" }, { key: "drawing", screen: "game-drawing" }, { key: "math-portugues", screen: "game-math-portugues" },
  { key: "letter-hunt", screen: "game-letter-hunt" },
];

export default function StudentHub({ student, onSelectGame, onLogout }: Props) {
  const avg = getStudentAvgScore(student); const level = getLevelInfo(avg);
  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#fff7ed] via-[#f8f7ff] to-[#ecfeff] px-4 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b-2 border-indigo-100 pb-4 sm:pb-5">
          <div className="flex items-center gap-2"><span role="img" aria-label="Livro" className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl shadow-[0_4px_0_#c7d2fe]">📖</span><span className="font-title text-xl font-bold text-slate-900 sm:text-2xl">Letter Play</span></div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600"><LogOut className="h-4 w-4" /> Sair</button>
        </header>
        <section className="grid gap-6 py-7 sm:gap-8 sm:py-10 lg:grid-cols-[1fr_260px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Área do aluno</p>
            <h1 className="mt-2 font-title text-3xl font-bold text-slate-950 sm:text-5xl">Olá, {student.name}.</h1>
            <p className="mt-3 text-base text-slate-500">Escolha uma atividade para continuar praticando.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GAME_KEYS.map((item) => {
                const info = GAME_LABELS[item.key] || { name: item.key, emoji: "", desc: "" };
                const best = student.scores[item.key]; const played = student.gamesPlayed[item.key] || 0;
                return <button key={item.key} onClick={() => onSelectGame(item.screen)} className="group soft-panel flex min-h-[154px] flex-col justify-between rounded-3xl border-2 border-indigo-100 bg-white/90 p-4 text-left shadow-[0_5px_0_#e0e7ff] transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_9px_0_#c7d2fe] active:translate-y-0 sm:p-5">
                  <div><div className="mb-3 flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-100 to-indigo-100 text-lg transition-transform group-hover:rotate-6 group-hover:scale-110">{info.emoji}</span><span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Atividade</span></div><h2 className="font-title text-xl font-bold text-slate-900 group-hover:text-indigo-700">{info.name}</h2><p className="mt-1 text-sm leading-snug text-slate-500">{info.desc.replace(/^[^a-zA-ZÀ-ÿ]*/, "")}</p></div>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400"><span>{best !== undefined ? `Recorde ${best}%` : "Ainda não jogado"}</span><span className="inline-flex items-center gap-1 text-teal-600">{played ? `${played}x` : "Começar"}<ArrowUpRight className="h-3.5 w-3.5" /></span></div>
                </button>;
              })}
            </div>
          </div>
          <aside className="h-fit rounded-3xl border-2 border-amber-100 bg-white/90 p-5 shadow-[0_6px_0_#fde68a] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Seu progresso</p>
            <div className="mt-5 flex items-end justify-between"><span className="font-title text-5xl font-bold text-slate-900">{avg}%</span><span className="pb-1 text-sm font-bold text-teal-600">{level.label}</span></div>
            <div className="mt-4 h-2 bg-slate-100"><div className="h-full bg-teal-500" style={{ width: `${Math.max(4, avg)}%` }} /></div>
            <dl className="mt-6 divide-y divide-slate-100 text-sm"><div className="flex justify-between py-3"><dt className="text-slate-500">XP acumulado</dt><dd className="font-bold text-slate-900">{student.totalPoints || 0}</dd></div><div className="flex justify-between py-3"><dt className="text-slate-500">Jogos disponíveis</dt><dd className="font-bold text-slate-900">10</dd></div></dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
