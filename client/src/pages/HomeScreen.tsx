import React from "react";

interface Props { onNavigate: (screen: "teacher-login" | "student-login") => void; }

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#fff7ed] via-[#f8f7ff] to-[#ecfeff] px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <section className="max-w-xl">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span role="img" aria-label="Livro do Letter Play" className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-4xl shadow-[0_7px_0_#c7d2fe]">📖</span>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">Letter Play</span>
            </div>
            <h1 className="font-title text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-7xl">Aprender pode ser simples.</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">Atividades curtas para praticar leitura, escrita e matemática com autonomia.</p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2">
              <button onClick={() => onNavigate("student-login")} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_6px_0_#0f766e] transition-all hover:bg-teal-600 active:translate-y-1 active:shadow-none">🎒 Entrar como aluno</button>
              <button onClick={() => onNavigate("teacher-login")} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-fuchsia-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-800 shadow-[0_6px_0_#f5d0fe] transition-all hover:bg-fuchsia-50 active:translate-y-1 active:shadow-none">🧑‍🏫 Área do professor</button>
            </div>
            <p className="mt-7 text-xs font-semibold text-slate-400">Demonstração: maria@escola.com / 123</p>
          </section>
          <section className="relative mt-5 min-h-[300px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-200 via-fuchsia-100 to-amber-100 shadow-[0_10px_0_#c7d2fe] sm:min-h-[400px] lg:mt-0 lg:min-h-[440px]">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#c7e9e4]" />
            <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#f6e8c7]" />
            <div className="relative flex h-full min-h-[300px] items-center justify-center p-5 sm:min-h-[400px] sm:p-10 lg:min-h-[440px]">
              <div className="max-w-xs rounded-3xl border-2 border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Hoje</p>
                <p className="mt-3 font-title text-3xl font-bold text-slate-900">10 atividades</p>
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
