import React, { useState } from "react";
import wallpaper from "@/imports/wallpaper.jpg";
import mascot from "@/imports/mascot.png";
import { getStoredTeachers } from "@/store";
import { Teacher } from "@/types";
import { ArrowLeft, LogIn } from "lucide-react";

interface Props {
  onSuccess: (teacher: Teacher) => void;
  onNavigateRegister: () => void;
  onBack: () => void;
}

export default function TeacherLogin({ onSuccess, onNavigateRegister, onBack }: Props) {
  const [email, setEmail] = useState("ana@escola.com");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const teachers = getStoredTeachers();
    const found = teachers.find(
      (t) => t.email.trim().toLowerCase() === email.trim().toLowerCase() && t.password === password
    );

    if (found) {
      onSuccess(found);
    } else {
      setError("Email ou senha incorretos! Tente ana@escola.com com senha 123.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="absolute inset-0 bg-[#FFFBF0]/65 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 font-bold rounded-2xl border border-amber-200 shadow-sm active:scale-95 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-4 border-[#FF6B6B]/30 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border-2 border-rose-200 mb-2">
              <span className="text-4xl">👩‍🏫</span>
            </div>
            <h2 className="font-['Fredoka'] text-3xl font-extrabold text-[#3D3580]">
              Área do Professor
            </h2>
            <p className="text-gray-500 text-sm font-semibold">
              Gerencie suas turmas e visualize o progresso pedagógico
            </p>
          </div>

          {error && (
            <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold mb-4 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Email Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo: ana@escola.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#FF6B6B] focus:outline-none font-bold text-gray-800 bg-amber-50/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#FF6B6B] focus:outline-none font-bold text-gray-800 bg-amber-50/30 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3.5 bg-[#FF6B6B] hover:bg-[#fa5555] text-white font-['Fredoka'] font-bold text-lg rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Acessar Painel</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-amber-100 flex flex-col items-center gap-2">
            <button
              onClick={onNavigateRegister}
              className="text-sm font-bold text-[#3D3580] hover:text-[#FF6B6B] transition-colors underline"
            >
              Não tem conta? Cadastre-se aqui!
            </button>
            <span className="text-xs text-gray-400 font-semibold">
              Demonstração: ana@escola.com / 123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
