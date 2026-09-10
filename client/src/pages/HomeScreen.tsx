import React from "react";
import mascot from "@/imports/mascot.png";

interface Props { onNavigate: (screen: "teacher-login" | "student-login") => void; }

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-8 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <section className="max-w-xl">
            <div className="mb-7 flex items-center gap-3">
              <img src={mascot} alt="Mascote Letter Play" className="h-16 w-16 object-contain" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">Letter Play</span>
            </div>
            <h1 className="font-title text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-7xl">Aprender pode ser simples.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">Atividades curtas para praticar leitura, escrita e matemática com autonomia.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => onNavigate("student-login")} className="bg-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-teal-700">Entrar como aluno</button>
              <button onClick={() => onNavigate("teacher-login")} className="border border-slate-300 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-800 hover:border-slate-400 hover:bg-slate-50">Área do professor</button>
            </div>
            <p className="mt-7 text-xs font-semibold text-slate-400">Demonstração: maria@escola.com / 123</p>
          </section>
          <section className="relative hidden min-h-[440px] overflow-hidden bg-[#e6f4f1] lg:block">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#c7e9e4]" />
            <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#f6e8c7]" />
            <div className="relative flex h-full min-h-[440px] items-center justify-center p-10">
              <div className="max-w-xs border border-white/70 bg-white/80 p-7 shadow-sm backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Hoje</p>
                <p className="mt-3 font-title text-3xl font-bold text-slate-900">9 atividades</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">Escolha uma missão e avance no seu ritmo, com dicas quando precisar.</p>
                <div className="mt-7 h-1.5 w-full bg-slate-200"><div className="h-full w-2/3 bg-teal-500" /></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
