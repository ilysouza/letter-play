import React, { useEffect, useMemo, useState } from "react";
import { Student } from "@/types";
import { GameHeader, GameResult } from "@/components/GameShared";
import { ALL_RACE_WORDS, shuffle } from "@/dailyWords";
import { getStudentRound, updateStudentScore } from "@/store";
import { speak } from "@/audio";
import { Search, Volume2, Sparkles } from "lucide-react";

interface Props { student: Student; onBack: () => void; }
const ROUND_SIZE = 5;

export default function LetterHuntGame({ student, onBack }: Props) {
  const [items, setItems] = useState<{ word: string; image: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const round = getStudentRound(student.id, "letter-hunt", Math.ceil(ALL_RACE_WORDS.length / ROUND_SIZE));
    const start = (round * ROUND_SIZE) % ALL_RACE_WORDS.length;
    const rotated = [...ALL_RACE_WORDS.slice(start), ...ALL_RACE_WORDS.slice(0, start)];
    setItems(rotated.slice(0, ROUND_SIZE));
    if (student.audioEnabled) speak(rotated[0].word);
  }, [student.id, student.audioEnabled]);

  const current = items[index];

  const makeOptions = () => {
    if (!current) return [];
    const initial = current.word[0];
    const distractors = Array.from(new Set(ALL_RACE_WORDS.map((item) => item.word[0]).filter((letter) => letter !== initial)));
    return shuffle([initial, ...distractors]).slice(0, 4);
  };
  const options = useMemo(() => makeOptions(), [current?.word]);

  if (!current) return <div className="p-8 text-center font-title text-xl">Preparando a caça...</div>;

  const choose = (letter: string) => {
    if (selected) return;
    setSelected(letter);
    const hit = letter === current.word[0];
    if (hit) setCorrect((value) => value + 1);
    window.setTimeout(() => {
      if (index + 1 >= items.length) {
        const finalCorrect = correct + (hit ? 1 : 0);
        updateStudentScore(student.id, "letter-hunt", Math.round((finalCorrect / items.length) * 100), finalCorrect * 12);
        setFinished(true);
      } else {
        setIndex((value) => value + 1);
        setSelected(null);
      }
    }, 650);
  };

  if (finished) return <GameResult score={Math.round((correct / items.length) * 100)} total={items.length} correct={correct} xpEarned={correct * 12} onBack={onBack} />;

  return <main className="mx-auto max-w-3xl px-4 py-5 sm:py-8">
    <GameHeader title="Caça à Letra" emoji="🔎" onBack={onBack} progress={index + 1} total={items.length} score={correct} />
    <section className="relative overflow-hidden rounded-[2rem] border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-amber-50 p-5 shadow-[0_16px_0_#dbe4ff] sm:p-9">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-yellow-200/60" />
      <div className="relative text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 shadow-sm"><Sparkles className="h-4 w-4" /> Olhe com atenção</div>
        <h2 className="font-title text-2xl font-bold text-slate-900 sm:text-3xl">Qual é a primeira letra?</h2>
        <div className="mx-auto mt-6 flex max-w-sm flex-col items-center rounded-3xl bg-white p-4 shadow-sm">
          <div className="relative"><img src={current.image} alt="Imagem para descobrir a letra" className="h-48 w-48 rounded-2xl object-cover ring-4 ring-indigo-100" />{student.audioEnabled && <button onClick={() => speak(current.word)} className="absolute bottom-2 right-2 rounded-full bg-indigo-500 p-3 text-white shadow-lg hover:bg-indigo-600"><Volume2 className="h-5 w-5" /></button>}</div>
          <p className="mt-3 text-sm font-bold text-slate-500">A palavra começa com...</p>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{options.map((letter) => { const state = selected === letter ? (letter === current.word[0] ? "bg-emerald-400 border-emerald-500" : "bg-rose-400 border-rose-500") : "bg-white border-indigo-200 hover:-translate-y-1 hover:bg-indigo-100"; return <button key={letter} onClick={() => choose(letter)} disabled={!!selected} className={`rounded-2xl border-2 px-4 py-5 font-title text-4xl font-black text-slate-900 shadow-[0_5px_0_rgba(99,102,241,.12)] transition-all active:translate-y-1 ${state}`}>{letter}</button>; })}</div>
      </div>
    </section>
  </main>;
}
