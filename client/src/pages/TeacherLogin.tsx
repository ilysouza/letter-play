import React, { useState } from "react";
import { loginTeacherOnline } from "@/store";
import { Teacher } from "@/types";
import { ArrowLeft, LogIn, Loader2 } from "lucide-react";

interface Props { onSuccess: (teacher: Teacher) => void; onNavigateRegister: () => void; onBack: () => void; }

export default function TeacherLogin({ onSuccess, onNavigateRegister, onBack }: Props) {
  const [email, setEmail] = useState("ana@escola.com");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError("");
    setLoading(true);
    try {
      onSuccess(await loginTeacherOnline(email, password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar agora. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="min-h-screen bg-[#f8fafc] px-4 py-5 sm:px-8 sm:py-8"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center"><div className="w-full max-w-md"><button onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Voltar ao início</button><div className="soft-panel rounded-3xl border-2 border-indigo-100 bg-white/95 p-5 shadow-[0_8px_0_#e0e7ff] sm:p-9"><div className="mb-8 flex items-center gap-3"><span role="img" aria-label="Livro" className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-3xl shadow-[0_5px_0_#c7d2fe]">📖</span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-500">Letter Play</p><h1 className="font-title text-3xl font-bold text-slate-950">Área do professor</h1></div></div><p className="mb-7 text-sm leading-relaxed text-slate-500">Gerencie suas turmas e acompanhe a evolução dos alunos de qualquer computador.</p>{error && <div className="mb-4 border-l-2 border-rose-500 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}<form onSubmit={handleLogin} className="space-y-5"><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Email institucional</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-rose-500" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Senha</span><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-rose-500" /></label><button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fuchsia-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_5px_0_#a21caf] hover:bg-fuchsia-600 disabled:cursor-wait disabled:opacity-60 active:translate-y-1 active:shadow-none">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} {loading ? "Conectando..." : "Acessar painel"}</button></form><div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4"><button onClick={onNavigateRegister} className="text-left text-sm font-bold text-slate-700 hover:text-rose-600">Criar uma conta de professor →</button><span className="text-xs text-slate-400">Os dados ficam sincronizados online.</span></div></div></div></div></main>;
}
