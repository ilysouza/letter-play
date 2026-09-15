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
          </section>
          <section
  className="relative mt-5 min-h-[300px] overflow-hidden rounded-[2rem] bg-cover bg-center shadow-[0_10px_0_#c7d2fe] sm:min-h-[400px] lg:mt-0 lg:min-h-[440px]"
  style={{
    backgroundImage:
      "url('https://img.magnific.com/fotos-gratis/criancas-lendo-na-biblioteca_1098-4048.jpg?semt=ais_hybrid&w=740&q=80')",
  }}
>
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 via-fuchsia-200/20 to-amber-200/30" />

  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#c7e9e4]/50" />

  <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#f6e8c7]/50" />

  <div className="absolute bottom-10 right-24 h-32 w-32 rounded-full bg-white/20" />
</section>
        </div>
      </div>
    </main>
  );
}
