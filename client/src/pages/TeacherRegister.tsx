import React, { useState } from "react";
import { getStoredTeachers, saveTeachers } from "@/store";
import { Teacher } from "@/types";
import { ArrowLeft, UserPlus } from "lucide-react";

interface Props {
  onSuccess: (teacher: Teacher) => void;
  onBackToLogin: () => void;
}

export default function TeacherRegister({ onSuccess, onBackToLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Todos os campos devem ser preenchidos!");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    const teachers = getStoredTeachers();
    if (teachers.some((t) => t.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("Este email já está cadastrado!");
      return;
    }

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    teachers.push(newTeacher);
    saveTeachers(teachers);
    onSuccess(newTeacher);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#FFFBF0]">
      <div className="w-full max-w-md">
        <button
          onClick={onBackToLogin}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 text-gray-700 font-bold rounded-2xl border border-amber-200 shadow-sm active:scale-95 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Login</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border-2 border-rose-200 mb-2">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="font-['Fredoka'] text-3xl font-extrabold text-[#3D3580]">
              Criar Conta de Professor
            </h2>
            <p className="text-gray-500 text-sm font-semibold">
              Cadastre-se para criar turmas e avaliar seus alunos
            </p>
          </div>

          {error && (
            <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Profª Carolina Silva"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#FF6B6B] focus:outline-none font-bold text-gray-800 bg-amber-50/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@escola.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#FF6B6B] focus:outline-none font-bold text-gray-800 bg-amber-50/20 text-sm"
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
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#FF6B6B] focus:outline-none font-bold text-gray-800 bg-amber-50/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 focus:border-[#FF6B6B] focus:outline-none font-bold text-gray-800 bg-amber-50/20 text-sm"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3.5 bg-[#FF6B6B] hover:bg-[#fa5555] text-white font-['Fredoka'] font-bold text-lg rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Concluir Cadastro</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
