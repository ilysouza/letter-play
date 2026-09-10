import React from "react";
import { Student, Screen } from "@/types";
import { GAME_LABELS } from "@/dailyWords";
import { getStudentAvgScore, getLevelInfo } from "@/store";
import mascot from "@/imports/mascot.png";
import { LogOut, Star, Sparkles, Trophy, Award } from "lucide-react";

interface Props {
  student: Student;
  onSelectGame: (screen: Screen) => void;
  onLogout: () => void;
}

const GAME_KEYS: { key: string; screen: Screen; color: string }[] = [
  { key: "drag-drop", screen: "game-drag-drop", color: "from-amber-400 to-orange-400" },
  { key: "spelling-quiz", screen: "game-spelling-quiz", color: "from-teal-400 to-emerald-400" },
  { key: "word-race", screen: "game-word-race", color: "from-rose-400 to-red-400" },
  { key: "word-search", screen: "game-word-search", color: "from-blue-400 to-indigo-400" },
  { key: "image-word", screen: "game-image-word", color: "from-purple-400 to-pink-400" },
  { key: "crossword", screen: "game-crossword", color: "from-yellow-400 to-amber-500" },
  { key: "math", screen: "game-math", color: "from-emerald-400 to-teal-500" },
  { key: "drawing", screen: "game-drawing", color: "from-pink-400 to-rose-400" },
  { key: "math-portugues", screen: "game-math-portugues", color: "from-indigo-400 to-purple-500" },
];

export default function StudentHub({ student, onSelectGame, onLogout }: Props) {
  const avg = getStudentAvgScore(student);
  const level = getLevelInfo(avg);

  return (
    <div className="min-h-screen bg-[#FFFBF0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Banner Teal Superior com Dados do Aluno */}
        <div className="bg-gradient-to-r from-[#4ECDC4] via-[#45B7AF] to-[#369B93] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-4 border-white/50">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6 text-center md:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-3xl flex items-center justify-center p-2 border-2 border-white/40 shadow-inner">
                <img src={mascot} alt="Mascote" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="bg-white/25 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                    Nível Alfabético
                  </span>
                  <span className="text-xl">{level.emoji}</span>
                </div>
                <h1 className="font-['Fredoka'] text-3xl sm:text-4xl font-extrabold tracking-wide">
                  Olá, {student.name}!
                </h1>
                <p className="text-teal-100 text-sm font-semibold mt-1">
                  Pronto para aprender e acumular mais estrelinhas hoje?
                </p>
              </div>
            </div>

            {/* Badges de Score e XP */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/30 text-center">
                <div className="text-xs font-bold text-teal-100 uppercase">Média Geral</div>
                <div className="font-['Fredoka'] text-3xl font-extrabold text-white">
                  {avg}%
                </div>
              </div>

              <div className="bg-amber-400 text-amber-950 px-5 py-3 rounded-2xl shadow-md border-2 border-amber-300 text-center">
                <div className="text-xs font-extrabold uppercase flex items-center justify-center gap-1">
                  <span>⭐ XP</span>
                </div>
                <div className="font-['Fredoka'] text-3xl font-black">
                  {student.totalPoints || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progresso Alfabético */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-extrabold mb-1.5 text-teal-100">
              <span>Status: {level.label}</span>
              <span>{avg}% Concluído</span>
            </div>
            <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all duration-700"
                style={{ width: `${Math.max(5, avg)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grade de 9 Jogos Educativos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Fredoka'] text-2xl sm:text-3xl font-bold text-[#3D3580] flex items-center gap-2">
              <span>🎮</span>
              <span>Escolha sua Atividade</span>
            </h2>
            <span className="text-xs sm:text-sm font-bold text-gray-500">
              9 Jogos disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GAME_KEYS.map((item) => {
              const info = GAME_LABELS[item.key] || { name: item.key, emoji: "🎯", desc: "" };
              const bestScore = student.scores[item.key];
              const playedCount = student.gamesPlayed[item.key] || 0;
              const hasPlayed = bestScore !== undefined;

              return (
                <button
                  key={item.key}
                  onClick={() => onSelectGame(item.screen)}
                  className="group bg-white rounded-3xl p-5 border-3 border-amber-200/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left flex flex-col justify-between active:scale-98 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-sm text-white group-hover:scale-110 transition-transform`}
                    >
                      {info.emoji}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-['Fredoka'] text-xl font-bold text-[#3D3580] group-hover:text-teal-600 transition-colors">
                        {info.name}
                      </h3>
                      <p className="text-gray-500 text-xs font-semibold leading-relaxed line-clamp-2 mt-0.5">
                        {info.desc}
                      </p>
                    </div>
                  </div>

                  {/* Informações de Melhor Pontuação e Partidas */}
                  <div className="pt-3 border-t border-amber-100 flex items-center justify-between mt-2">
                    {hasPlayed ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="font-['Fredoka'] font-bold text-sm text-teal-700">
                            Recorde: {bestScore}%
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">
                          {playedCount}x jogado
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                        Novo! Toque para jogar
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rodapé com Logout */}
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-2xl border-2 border-rose-200 shadow-sm active:scale-95 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta do Aluno</span>
          </button>
        </div>
      </div>
    </div>
  );
}
