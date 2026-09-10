import React from "react";
import wallpaper from "@/imports/wallpaper.jpg";
import mascot from "@/imports/mascot.png";

interface Props {
  onNavigate: (screen: "teacher-login" | "student-login") => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {/* Overlay suave com toque quente para garantir legibilidade dos cards */}
      <div className="absolute inset-0 bg-[#FFFBF0]/65 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
        {/* Mascote animado */}
        <div className="relative mb-2">
          <img
            src={mascot}
            alt="Mascote do Letter Play"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-xl animate-bounce duration-1000"
          />
          <div className="absolute -top-2 -right-2 text-2xl">✨</div>
        </div>

        {/* Título Principal */}
        <h1 className="font-['Fredoka'] text-4xl sm:text-6xl font-black text-[#3D3580] tracking-wide drop-shadow-sm mb-2">
          Letter Play
        </h1>
        <p className="text-lg sm:text-2xl font-bold text-amber-900 mb-8 max-w-lg">
          Aprendendo a ler, escrever e calcular com muita diversão!
        </p>

        {/* Dois Cards Grandes de Seleção */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          {/* Card Aluno (Teal #4ECDC4) */}
          <button
            onClick={() => onNavigate("student-login")}
            className="group p-6 sm:p-8 rounded-3xl bg-[#4ECDC4] hover:bg-[#3dbdb4] text-white shadow-xl border-4 border-white/90 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl active:scale-95 text-center flex flex-col items-center cursor-pointer"
          >
            <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
              🧒
            </div>
            <h2 className="font-['Fredoka'] text-3xl font-extrabold tracking-wide mb-1">
              Sou Aluno
            </h2>
            <p className="text-teal-50 text-sm font-semibold">
              Jogar, praticar sílabas e somar pontos!
            </p>
          </button>

          {/* Card Professor (Vermelho #FF6B6B) */}
          <button
            onClick={() => onNavigate("teacher-login")}
            className="group p-6 sm:p-8 rounded-3xl bg-[#FF6B6B] hover:bg-[#fa5555] text-white shadow-xl border-4 border-white/90 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl active:scale-95 text-center flex flex-col items-center cursor-pointer"
          >
            <div className="w-20 h-20 bg-white/25 rounded-3xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
              👩‍🏫
            </div>
            <h2 className="font-['Fredoka'] text-3xl font-extrabold tracking-wide mb-1">
              Sou Professor
            </h2>
            <p className="text-red-50 text-sm font-semibold">
              Acompanhar turmas, alunos e desempenho!
            </p>
          </button>
        </div>

        {/* Rodapé sutil de demonstração */}
        <div className="mt-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 text-xs font-bold text-gray-600 shadow-sm">
          💡 Dica de demonstração: Professora: <span className="text-[#3D3580]">ana@escola.com</span> | Aluna: <span className="text-teal-700">maria@escola.com</span>
        </div>
      </div>
    </div>
  );
}
