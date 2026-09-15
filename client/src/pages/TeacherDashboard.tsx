import React, { useState } from "react";
import { Teacher, Student, Turma, GameSession } from "@/types";
import {
  getStoredTurmas,
  saveTurmas,
  getStoredStudents,
  saveStudents,
  getStoredSessions,
  deleteTurma,
  deleteStudent,
  toggleStudentAudio,
  getStudentAvgScore,
  getLevelInfo,
  formatDate,
} from "@/store";
import { GAME_LABELS } from "@/content/wordBank";
import {
  Users,
  GraduationCap,
  BarChart3,
  Calendar,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle,
  Award,
} from "lucide-react";

interface Props {
  teacher: Teacher;
  onLogout: () => void;
}

type Tab = "turmas" | "alunos" | "desempenho" | "historico";

export default function TeacherDashboard({ teacher, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("turmas");
  const [turmas, setTurmas] = useState<Turma[]>(() =>
    getStoredTurmas().filter((t) => t.teacherId === teacher.id)
  );
  const [students, setStudents] = useState<Student[]>(() =>
    getStoredStudents().filter((s) => s.teacherId === teacher.id)
  );
  const [sessions, setSessions] = useState<GameSession[]>(() => getStoredSessions());

  // Estado para TurmaView
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  // Formulário de criação de turma
  const [showCreateTurma, setShowCreateTurma] = useState(false);
  const [newYear, setNewYear] = useState("3º Ano");
  const [newLetter, setNewLetter] = useState("A");

  // Formulário inline de aluno
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormName, setStudentFormName] = useState("");
  const [studentFormEmail, setStudentFormEmail] = useState("");
  const [studentFormPassword, setStudentFormPassword] = useState("123");
  const [showStudentForm, setShowStudentForm] = useState(false);

  // Filtro de turma na aba Desempenho
  const [perfTurmaFilter, setPerfTurmaFilter] = useState<string>("all");

  // Aluno selecionado na aba Histórico
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);

  const refreshData = () => {
    setTurmas(getStoredTurmas().filter((t) => t.teacherId === teacher.id));
    setStudents(getStoredStudents().filter((s) => s.teacherId === teacher.id));
    setSessions(getStoredSessions());
  };

  const handleCreateTurma = (e: React.FormEvent) => {
    e.preventDefault();
    const newTurma: Turma = {
      id: `turma-${Date.now()}`,
      teacherId: teacher.id,
      year: newYear,
      letter: newLetter,
    };
    const allTurmas = getStoredTurmas();
    allTurmas.push(newTurma);
    saveTurmas(allTurmas);
    setShowCreateTurma(false);
    refreshData();
  };

  const handleDeleteTurma = (turmaId: string) => {
    if (confirm("Tem certeza que deseja excluir esta turma e todos os seus alunos?")) {
      deleteTurma(turmaId);
      if (selectedTurma?.id === turmaId) setSelectedTurma(null);
      refreshData();
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTurma) return;

    const allStudents = getStoredStudents();

    if (editingStudent) {
      // Atualizar aluno existente
      const idx = allStudents.findIndex((s) => s.id === editingStudent.id);
      if (idx !== -1) {
        allStudents[idx].name = studentFormName.trim();
        allStudents[idx].email = studentFormEmail.trim();
        allStudents[idx].password = studentFormPassword;
      }
    } else {
      // Novo aluno
      const newStudent: Student = {
        id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: studentFormName.trim(),
        email: studentFormEmail.trim().toLowerCase(),
        password: studentFormPassword,
        teacherId: teacher.id,
        turmaId: selectedTurma.id,
        scores: {},
        gamesPlayed: {},
        totalPoints: 0,
        audioEnabled: true,
      };
      allStudents.push(newStudent);
    }

    saveStudents(allStudents);
    setShowStudentForm(false);
    setEditingStudent(null);
    setStudentFormName("");
    setStudentFormEmail("");
    refreshData();
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Deseja remover este aluno permanentemente?")) {
      deleteStudent(studentId);
      refreshData();
    }
  };

  const handleToggleAudio = (studentId: string) => {
    toggleStudentAudio(studentId);
    refreshData();
  };

  // Alunos da turma atualmente aberta
  const currentTurmaStudents = selectedTurma
    ? students.filter((s) => s.turmaId === selectedTurma.id)
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Topo do Painel */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
              <GraduationCap className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h1 className="font-['Fredoka'] text-xl font-bold text-slate-900">
                Letter Play — Painel Pedagógico
              </h1>
              <p className="text-xs text-gray-500 font-bold">{teacher.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-xs sm:text-sm active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegação de Abas */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-6xl mx-auto flex gap-2 sm:gap-4 overflow-x-auto">
          {[
            { id: "turmas", label: "Turmas", icon: GraduationCap },
            { id: "alunos", label: "Alunos", icon: Users },
            { id: "desempenho", label: "Desempenho", icon: BarChart3 },
            { id: "historico", label: "Histórico", icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  setSelectedTurma(null);
                }}
                className={`flex items-center gap-2 py-3 px-4 font-['Fredoka'] font-bold text-sm sm:text-base border-b-3 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#FF6B6B] text-[#FF6B6B] bg-white rounded-t-2xl shadow-xs"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal por Aba */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
        {/* ================= ABA 1: TURMAS ================= */}
        {activeTab === "turmas" && (
          <div>
            {!selectedTurma ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-['Fredoka'] text-2xl font-bold text-slate-900">
                      Minhas Turmas
                    </h2>
                    <p className="text-sm text-gray-500 font-semibold">
                      Selecione uma turma para gerenciar alunos ou crie uma nova
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateTurma(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B6B] hover:bg-[#fa5555] text-white font-['Fredoka'] font-bold rounded-lg shadow-sm active:scale-95 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Turma</span>
                  </button>
                </div>

                {/* Modal / Formulário Criar Turma */}
                {showCreateTurma && (
                  <div className="mb-6 p-5 bg-white rounded-lg border-2 border-slate-300 shadow-sm max-w-lg">
                    <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-3">
                      Nova Turma
                    </h3>
                    <form onSubmit={handleCreateTurma} className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">
                            Ano Escolar
                          </label>
                          <select
                            value={newYear}
                            onChange={(e) => setNewYear(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 font-bold bg-slate-50/40 text-sm"
                          >
                            <option value="1º Ano">1º Ano</option>
                            <option value="2º Ano">2º Ano</option>
                            <option value="3º Ano">3º Ano</option>
                            <option value="4º Ano">4º Ano</option>
                            <option value="5º Ano">5º Ano</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 block mb-1">
                            Letra da Turma
                          </label>
                          <select
                            value={newLetter}
                            onChange={(e) => setNewLetter(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 font-bold bg-slate-50/40 text-sm"
                          >
                            <option value="A">Turma A</option>
                            <option value="B">Turma B</option>
                            <option value="C">Turma C</option>
                            <option value="D">Turma D</option>
                            <option value="E">Turma E</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCreateTurma(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#FF6B6B] hover:bg-[#fa5555] font-bold text-white rounded-lg text-xs shadow-xs"
                        >
                          Salvar Turma
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Grid de Cards de Turmas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {turmas.map((turma) => {
                    const turmaStudents = students.filter((s) => s.turmaId === turma.id);
                    const avgScores = turmaStudents.map((s) => getStudentAvgScore(s));
                    const turmaAvg =
                      avgScores.length > 0
                        ? Math.round(avgScores.reduce((a, b) => a + b, 0) / avgScores.length)
                        : 0;

                    return (
                      <div
                        key={turma.id}
                        onClick={() => setSelectedTurma(turma)}
                        className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-sm hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-['Fredoka'] text-2xl font-black text-slate-900">
                              {turma.year} - {turma.letter}
                            </span>
                            <span className="bg-amber-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
                              {turmaStudents.length} alunos
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                            <div className="text-xs text-gray-500 font-bold">Média da Turma</div>
                            <div className="font-['Fredoka'] text-2xl font-extrabold text-teal-600 mt-0.5">
                              {turmaAvg}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-gray-500">
                          <span>Toque para gerenciar</span>
                          <span className="text-[#FF6B6B]">Ver Alunos →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TurmaView: visualização detalhada da turma */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTurma(null)}
                      className="p-2 bg-white hover:bg-amber-100 rounded-lg border border-slate-200 active:scale-95"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div>
                      <h2 className="font-['Fredoka'] text-2xl font-bold text-slate-900">
                        {selectedTurma.year} - {selectedTurma.letter}
                      </h2>
                      <p className="text-xs text-gray-500 font-semibold">
                        Lista de alunos cadastrados nesta turma
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingStudent(null);
                        setStudentFormName("");
                        setStudentFormEmail("");
                        setShowStudentForm(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4ECDC4] hover:bg-[#3dbdb4] text-white font-['Fredoka'] font-bold rounded-lg shadow-sm text-xs sm:text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Aluno</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTurma(selectedTurma.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200"
                      title="Excluir turma"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Formulário de aluno (modal/inline) */}
                {showStudentForm && (
                  <div className="mb-6 p-5 bg-white rounded-lg border-2 border-teal-300 shadow-sm max-w-md">
                    <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-3">
                      {editingStudent ? "Editar Aluno" : "Cadastrar Novo Aluno"}
                    </h3>
                    <form onSubmit={handleSaveStudent} className="flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">
                          Nome do Aluno
                        </label>
                        <input
                          type="text"
                          required
                          value={studentFormName}
                          onChange={(e) => setStudentFormName(e.target.value)}
                          placeholder="Ex: Beatriz Santos"
                          className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">
                          Email de Acesso
                        </label>
                        <input
                          type="email"
                          required
                          value={studentFormEmail}
                          onChange={(e) => setStudentFormEmail(e.target.value)}
                          placeholder="beatriz@escola.com"
                          className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">
                          Senha
                        </label>
                        <input
                          type="password"
                          required
                          value={studentFormPassword}
                          onChange={(e) => setStudentFormPassword(e.target.value)}
                          placeholder="123"
                          className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm"
                        />
                      </div>

                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setShowStudentForm(false)}
                          className="px-4 py-2 bg-gray-100 font-bold text-gray-700 rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#4ECDC4] font-bold text-white rounded-lg text-xs shadow-xs"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lista de Alunos da Turma */}
                <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm">
                  {currentTurmaStudents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-bold">
                      Nenhum aluno cadastrado nesta turma ainda.
                    </div>
                  ) : (
                    <div className="divide-y divide-amber-100">
                      {currentTurmaStudents.map((student) => {
                        const avg = getStudentAvgScore(student);
                        const level = getLevelInfo(avg);

                        return (
                          <div
                            key={student.id}
                            className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-lg flex items-center justify-center font-['Fredoka'] font-black text-xl">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-['Fredoka'] text-lg font-bold text-slate-900">
                                  {student.name}
                                </h4>
                                <p className="text-xs text-gray-500 font-semibold">
                                  {student.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-right">
                                <div className="text-xs text-gray-400 font-bold">Média</div>
                                <div className="font-['Fredoka'] text-lg font-bold text-teal-600">
                                  {avg}%
                                </div>
                              </div>

                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${level.bg}`}
                              >
                                {level.label} {level.emoji}
                              </span>

                              {/* Botão Áudio On/Off */}
                              <button
                                onClick={() => handleToggleAudio(student.id)}
                                aria-pressed={student.audioEnabled}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-extrabold transition-all ${
                                  student.audioEnabled
                                    ? "bg-teal-50 border-teal-200 text-teal-700"
                                    : "bg-slate-100 border-slate-300 text-slate-500"
                                }`}
                                title={
                                  student.audioEnabled
                                    ? "Narração em áudio ATIVADA"
                                    : "Narração em áudio DESATIVADA"
                                }
                              >
                                {student.audioEnabled ? (
                                  <><Volume2 className="w-4 h-4" /> Áudio ligado</>
                                ) : (
                                  <><VolumeX className="w-4 h-4" /> Áudio desligado</>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingStudent(student);
                                  setStudentFormName(student.name);
                                  setStudentFormEmail(student.email);
                                  setStudentFormPassword(student.password);
                                  setShowStudentForm(true);
                                }}
                                className="p-2 hover:bg-amber-100 rounded-lg text-gray-600"
                                title="Editar aluno"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="p-2 hover:bg-rose-100 rounded-lg text-rose-500"
                                title="Excluir aluno"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: ALUNOS (LISTA FLAT) ================= */}
        {activeTab === "alunos" && (
          <div>
            <div className="mb-6">
              <h2 className="font-['Fredoka'] text-2xl font-bold text-slate-900">
                Todos os Alunos
              </h2>
              <p className="text-sm text-gray-500 font-semibold">
                Visão unificada de todos os alunos cadastrados pelo professor
              </p>
            </div>

            <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-gray-600 uppercase font-black">
                    <tr>
                      <th className="p-4">Aluno</th>
                      <th className="p-4">Turma</th>
                      <th className="p-4">Pontuação Média</th>
                      <th className="p-4">Nível</th>
                      <th className="p-4">Dias Ativos</th>
                      <th className="p-4">XP Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {students.map((student) => {
                      const turma = turmas.find((t) => t.id === student.turmaId);
                      const avg = getStudentAvgScore(student);
                      const level = getLevelInfo(avg);
                      // Calcular dias ativos diferentes baseado nas sessões
                      const studentSessions = sessions.filter((s) => s.studentId === student.id);
                      const activeDaysCount = new Set(studentSessions.map((s) => s.date)).size;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/30">
                          <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div>{student.name}</div>
                              <div className="text-xs text-gray-400 font-normal">
                                {student.email}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-gray-700">
                            {turma ? `${turma.year} - ${turma.letter}` : "Sem turma"}
                          </td>
                          <td className="p-4 font-['Fredoka'] font-bold text-teal-600 text-base">
                            {avg}%
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${level.bg}`}
                            >
                              {level.label} {level.emoji}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-600">{activeDaysCount} dias</td>
                          <td className="p-4 font-['Fredoka'] font-black text-amber-500">
                            ⭐ {student.totalPoints || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 3: DESEMPENHO ================= */}
        {activeTab === "desempenho" && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Fredoka'] text-2xl font-bold text-slate-900">
                  Desempenho Geral e Comparativo
                </h2>
                <p className="text-sm text-gray-500 font-semibold">
                  Métricas agregadas, evolução por jogo e ranking pedagógico
                </p>
              </div>

              {/* Filtro por Turma */}
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPerfTurmaFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    perfTurmaFilter === "all"
                      ? "bg-amber-400 text-amber-950 shadow-xs"
                      : "text-gray-600 hover:bg-slate-50"
                  }`}
                >
                  Todas as Turmas
                </button>
                {turmas.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPerfTurmaFilter(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      perfTurmaFilter === t.id
                        ? "bg-amber-400 text-amber-950 shadow-xs"
                        : "text-gray-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.year} - {t.letter}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const filteredStudents =
                perfTurmaFilter === "all"
                  ? students
                  : students.filter((s) => s.turmaId === perfTurmaFilter);

              const allAvgs = filteredStudents.map((s) => getStudentAvgScore(s));
              const generalAvg =
                allAvgs.length > 0 ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) : 0;
              const playedCount = filteredStudents.filter((s) => s.totalPoints > 0).length;

              // Ranking ordenado
              const rankedStudents = [...filteredStudents].sort(
                (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
              );

              return (
                <div className="flex flex-col gap-6">
                  {/* 4 Cards de Resumo */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border-2 border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-500 uppercase">Total Alunos</div>
                      <div className="font-['Fredoka'] text-3xl font-black text-slate-900 mt-1">
                        {filteredStudents.length}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border-2 border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-500 uppercase">Média Geral</div>
                      <div className="font-['Fredoka'] text-3xl font-black text-teal-600 mt-1">
                        {generalAvg}%
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border-2 border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-500 uppercase">Já Jogaram</div>
                      <div className="font-['Fredoka'] text-3xl font-black text-amber-500 mt-1">
                        {playedCount} / {filteredStudents.length}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border-2 border-slate-200 shadow-sm">
                      <div className="text-xs font-bold text-gray-500 uppercase">Nº de Turmas</div>
                      <div className="font-['Fredoka'] text-3xl font-black text-purple-600 mt-1">
                        {perfTurmaFilter === "all" ? turmas.length : 1}
                      </div>
                    </div>
                  </div>

                  {/* Barras Comparativas entre Turmas (se Todas + múltiplas turmas) */}
                  {perfTurmaFilter === "all" && turmas.length > 1 && (
                    <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
                      <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-4">
                        Comparativo Entre Turmas
                      </h3>
                      <div className="flex flex-col gap-4">
                        {turmas.map((t) => {
                          const tStudents = students.filter((s) => s.turmaId === t.id);
                          const tAvgs = tStudents.map((s) => getStudentAvgScore(s));
                          const tAvg =
                            tAvgs.length > 0
                              ? Math.round(tAvgs.reduce((a, b) => a + b, 0) / tAvgs.length)
                              : 0;

                          return (
                            <div key={t.id}>
                              <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                                <span>
                                  {t.year} - {t.letter} ({tStudents.length} alunos)
                                </span>
                                <span className="text-teal-700 font-['Fredoka']">{tAvg}%</span>
                              </div>
                              <div className="w-full bg-amber-100 h-3.5 rounded-full overflow-hidden p-0.5">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500"
                                  style={{ width: `${tAvg}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Barras de Média por Jogo */}
                  <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
                    <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-4">
                      Média de Pontuação por Atividade
                    </h3>
                    <div className="flex flex-col gap-3.5">
                      {Object.entries(GAME_LABELS).map(([gameKey, info]) => {
                        const scores = filteredStudents
                          .map((s) => s.scores[gameKey])
                          .filter((v): v is number => v !== undefined);
                        const avg =
                          scores.length > 0
                            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                            : 0;
                        const level = getLevelInfo(avg);

                        return (
                          <div key={gameKey}>
                            <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-700 mb-1">
                              <span className="flex items-center gap-1.5">
                                <span>{info.emoji}</span>
                                <span>{info.name}</span>
                              </span>
                              <span style={{ color: level.color }} className="font-['Fredoka']">
                                {avg > 0 ? `${avg}%` : "Ainda sem partidas"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(avg, 2)}%`,
                                  backgroundColor: level.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ranking Pedagógico com Medalhas */}
                  <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
                    <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span>🏆</span>
                      <span>Ranking de Participação e XP</span>
                    </h3>
                    <div className="divide-y divide-amber-100">
                      {rankedStudents.slice(0, 10).map((st, rank) => {
                        const medals = ["🥇", "🥈", "🥉"];
                        return (
                          <div
                            key={st.id}
                            className="py-3 flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 text-center font-['Fredoka'] font-bold text-lg">
                                {rank < 3 ? medals[rank] : `#${rank + 1}`}
                              </div>
                              <div className="font-bold text-slate-900">{st.name}</div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-['Fredoka'] font-extrabold text-amber-500">
                                ⭐ {st.totalPoints || 0} XP
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= ABA 4: HISTÓRICO ================= */}
        {activeTab === "historico" && (
          <div>
            <div className="mb-6">
              <h2 className="font-['Fredoka'] text-2xl font-bold text-slate-900">
                Histórico de Frequência e Sessões
              </h2>
              <p className="text-sm text-gray-500 font-semibold">
                Acompanhe os últimos 14 dias de atividade de cada estudante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coluna 1: Lista de Alunos Clicáveis */}
              <div className="bg-white rounded-lg p-4 border-2 border-slate-200 shadow-sm">
                <h3 className="font-['Fredoka'] text-base font-bold text-slate-900 mb-3 px-2">
                  Selecione o Aluno:
                </h3>
                <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto">
                  {students.map((student) => {
                    const isSelected =
                      historyStudentId === student.id ||
                      (!historyStudentId && student.id === students[0]?.id);

                    return (
                      <button
                        key={student.id}
                        onClick={() => setHistoryStudentId(student.id)}
                        className={`p-3 rounded-lg text-left font-bold text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-400 text-amber-950 shadow-sm"
                            : "hover:bg-slate-50 text-gray-700"
                        }`}
                      >
                        <span>{student.name}</span>
                        <span className="text-xs font-normal">
                          {sessions.filter((s) => s.studentId === student.id).length} sessões
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 2: Detalhes do Aluno Selecionado */}
              <div className="md:col-span-2 flex flex-col gap-6">
                {(() => {
                  const targetId = historyStudentId || students[0]?.id;
                  const activeStudent = students.find((s) => s.id === targetId);
                  if (!activeStudent) {
                    return (
                      <div className="bg-white p-8 rounded-lg border-2 border-slate-200 text-center text-gray-500 font-bold">
                        Nenhum aluno selecionado.
                      </div>
                    );
                  }

                  const studentSessions = sessions
                    .filter((s) => s.studentId === activeStudent.id)
                    .sort((a, b) => b.timestamp - a.timestamp);

                  // Gerar 14 dias anteriores
                  const last14Days: { dateStr: string; label: string; sessions: GameSession[] }[] =
                    [];
                  const now = new Date();
                  for (let i = 13; i >= 0; i--) {
                    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    const dateStr = d.toISOString().split("T")[0];
                    const daySessions = studentSessions.filter((s) => s.date === dateStr);
                    last14Days.push({
                      dateStr,
                      label: `${d.getDate()}/${d.getMonth() + 1}`,
                      sessions: daySessions,
                    });
                  }

                  return (
                    <>
                      {/* Box de Frequência dos 14 Dias */}
                      <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
                        <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-4">
                          Frequência nos Últimos 14 Dias — {activeStudent.name}
                        </h3>

                        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                          {last14Days.map((day, idx) => {
                            const hasActivity = day.sessions.length > 0;
                            const avgScore = hasActivity
                              ? Math.round(
                                  day.sessions.reduce((acc, s) => acc + s.score, 0) /
                                    day.sessions.length
                                )
                              : 0;

                            const dotColor = !hasActivity
                              ? "bg-gray-200 text-gray-400"
                              : avgScore >= 80
                              ? "bg-emerald-500 text-white"
                              : avgScore >= 50
                              ? "bg-blue-500 text-white"
                              : "bg-amber-400 text-amber-950";

                            return (
                              <div key={idx} className="flex flex-col items-center gap-1.5 min-w-[36px]">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-['Fredoka'] font-bold text-xs shadow-xs transition-transform hover:scale-110 ${dotColor}`}
                                  title={`${day.dateStr}: ${day.sessions.length} partida(s) com média ${avgScore}%`}
                                >
                                  {hasActivity ? `${avgScore}%` : "—"}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">
                                  {day.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Histórico detalhado de sessões */}
                      <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
                        <h3 className="font-['Fredoka'] text-lg font-bold text-slate-900 mb-4">
                          Sessões Registradas
                        </h3>

                        {studentSessions.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 font-bold text-sm">
                            Nenhuma partida registrada para este aluno ainda.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                            {studentSessions.map((ses) => {
                              const gameInfo = GAME_LABELS[ses.game] || {
                                name: ses.game,
                                emoji: "🎯",
                              };
                              return (
                                <div
                                  key={ses.id}
                                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xl">{gameInfo.emoji}</span>
                                    <div>
                                      <span className="font-['Fredoka'] font-bold text-slate-900">
                                        {gameInfo.name}
                                      </span>
                                      <span className="text-xs text-gray-400 block font-semibold">
                                        {formatDate(ses.date)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="font-['Fredoka'] font-black text-teal-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                                    {ses.score}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
