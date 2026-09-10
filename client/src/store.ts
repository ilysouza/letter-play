import { Teacher, Student, Turma, GameSession } from "./types";

const KEY_TEACHERS = "alfajogo_teachers";
const KEY_STUDENTS = "alfajogo_students";
const KEY_TURMAS = "alfajogo_turmas";
const KEY_SESSIONS = "alfajogo_sessions";
const KEY_SEEDED = "alfajogo_seeded_v4";

// Funções utilitárias de armazenamento
export function getStoredTeachers(): Teacher[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_TEACHERS) || "[]");
  } catch {
    return [];
  }
}

export function saveTeachers(teachers: Teacher[]): void {
  localStorage.setItem(KEY_TEACHERS, JSON.stringify(teachers));
}

export function getStoredStudents(): Student[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_STUDENTS) || "[]");
  } catch {
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(KEY_STUDENTS, JSON.stringify(students));
}

export function getStoredTurmas(): Turma[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_TURMAS) || "[]");
  } catch {
    return [];
  }
}

export function saveTurmas(turmas: Turma[]): void {
  localStorage.setItem(KEY_TURMAS, JSON.stringify(turmas));
}

export function getStoredSessions(): GameSession[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_SESSIONS) || "[]");
  } catch {
    return [];
  }
}

export function saveSessions(sessions: GameSession[]): void {
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions));
}

// Atualizar pontuação e XP do aluno após uma partida
export function updateStudentScore(studentId: string, game: string, score: number, xp: number): void {
  const students = getStoredStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  const currentBest = student.scores[game] || 0;
  student.scores[game] = Math.max(currentBest, score);
  student.gamesPlayed[game] = (student.gamesPlayed[game] || 0) + 1;
  student.totalPoints = (student.totalPoints || 0) + xp;

  saveStudents(students);

  // Registrar GameSession
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const sessions = getStoredSessions();
  const newSession: GameSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    date: dateStr,
    game,
    score,
    timestamp: Date.now(),
  };
  sessions.push(newSession);
  saveSessions(sessions);
}

// Inverte audioEnabled e salva
export function toggleStudentAudio(studentId: string): boolean {
  const students = getStoredStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) return false;
  student.audioEnabled = !student.audioEnabled;
  saveStudents(students);
  return student.audioEnabled;
}

// Exclusão de turma em cascata (remove a turma e seus alunos)
export function deleteTurma(turmaId: string): void {
  const turmas = getStoredTurmas().filter((t) => t.id !== turmaId);
  saveTurmas(turmas);

  const students = getStoredStudents().filter((s) => s.turmaId !== turmaId);
  saveStudents(students);
}

// Exclusão de um aluno específico
export function deleteStudent(studentId: string): void {
  const students = getStoredStudents().filter((s) => s.id !== studentId);
  saveStudents(students);
  const sessions = getStoredSessions().filter((s) => s.studentId !== studentId);
  saveSessions(sessions);
}

// Nível e cor de acordo com média
export function getLevelInfo(avg: number): { label: string; color: string; emoji: string; bg: string } {
  if (avg >= 80) return { label: "Avançado", color: "#10B981", emoji: "🌟", bg: "bg-emerald-100 text-emerald-800" };
  if (avg >= 50) return { label: "Intermediário", color: "#3B82F6", emoji: "⭐", bg: "bg-blue-100 text-blue-800" };
  if (avg > 0) return { label: "Em Desenvolvimento", color: "#F59E0B", emoji: "✨", bg: "bg-amber-100 text-amber-800" };
  return { label: "Iniciante", color: "#F97316", emoji: "📖", bg: "bg-orange-100 text-orange-800" };
}

// Média aritmética das pontuações do aluno
export function getStudentAvgScore(student: Student): number {
  const scores = Object.values(student.scores || {});
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / scores.length);
}

// Formatação amigável de data
export function formatDate(str: string): string {
  if (!str) return "";
  const [y, m, d] = str.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d} de ${months[m - 1]}`;
}

// Seed de demonstração: 1 professora (Ana), 2 turmas, 6 alunos, 23 sessões
export function checkAndSeedData(): void {
  if (localStorage.getItem(KEY_SEEDED)) return;

  const teacher: Teacher = {
    id: "teacher-1",
    name: "Profª. Ana Oliveira",
    email: "ana@escola.com",
    password: "123",
  };

  const turmas: Turma[] = [
    { id: "turma-1", teacherId: "teacher-1", year: "3º Ano", letter: "A" },
    { id: "turma-2", teacherId: "teacher-1", year: "3º Ano", letter: "B" },
  ];

  const students: Student[] = [
    {
      id: "student-1",
      name: "Maria Silva",
      email: "maria@escola.com",
      password: "123",
      teacherId: "teacher-1",
      turmaId: "turma-1",
      scores: {
        "drag-drop": 100,
        "spelling-quiz": 80,
        "word-race": 90,
        "word-search": 100,
        "image-word": 100,
        "crossword": 75,
        "math": 85,
        "math-portugues": 90,
      },
      gamesPlayed: {
        "drag-drop": 5,
        "spelling-quiz": 4,
        "word-race": 3,
        "word-search": 2,
        "image-word": 3,
        "crossword": 2,
        "math": 4,
        "math-portugues": 3,
      },
      totalPoints: 620,
      audioEnabled: true,
    },
    {
      id: "student-2",
      name: "Lucas Pereira",
      email: "lucas@escola.com",
      password: "123",
      teacherId: "teacher-1",
      turmaId: "turma-1",
      scores: {
        "drag-drop": 80,
        "spelling-quiz": 60,
        "word-race": 70,
        "word-search": 60,
        "image-word": 75,
        "crossword": 50,
        "math": 70,
        "math-portugues": 60,
      },
      gamesPlayed: {
        "drag-drop": 3,
        "spelling-quiz": 2,
        "word-race": 2,
        "word-search": 1,
        "image-word": 2,
        "crossword": 1,
        "math": 2,
        "math-portugues": 2,
      },
      totalPoints: 340,
      audioEnabled: true,
    },
    {
      id: "student-3",
      name: "Beatriz Santos",
      email: "beatriz@escola.com",
      password: "123",
      teacherId: "teacher-1",
      turmaId: "turma-1",
      scores: {
        "drag-drop": 90,
        "spelling-quiz": 85,
        "word-race": 95,
        "word-search": 80,
        "image-word": 100,
        "crossword": 90,
        "math": 95,
        "math-portugues": 90,
      },
      gamesPlayed: {
        "drag-drop": 4,
        "spelling-quiz": 4,
        "word-race": 4,
        "word-search": 3,
        "image-word": 3,
        "crossword": 3,
        "math": 3,
        "math-portugues": 3,
      },
      totalPoints: 590,
      audioEnabled: false,
    },
    {
      id: "student-4",
      name: "Gabriel Costa",
      email: "gabriel@escola.com",
      password: "123",
      teacherId: "teacher-1",
      turmaId: "turma-2",
      scores: {
        "drag-drop": 60,
        "spelling-quiz": 40,
        "word-race": 50,
        "word-search": 40,
        "image-word": 50,
        "crossword": 30,
        "math": 60,
        "math-portugues": 50,
      },
      gamesPlayed: {
        "drag-drop": 2,
        "spelling-quiz": 2,
        "word-race": 1,
        "word-search": 1,
        "image-word": 1,
        "crossword": 1,
        "math": 2,
        "math-portugues": 1,
      },
      totalPoints: 210,
      audioEnabled: true,
    },
    {
      id: "student-5",
      name: "Sofia Lima",
      email: "sofia@escola.com",
      password: "123",
      teacherId: "teacher-1",
      turmaId: "turma-2",
      scores: {
        "drag-drop": 100,
        "spelling-quiz": 100,
        "word-race": 85,
        "word-search": 90,
        "image-word": 100,
        "crossword": 85,
        "math": 100,
        "math-portugues": 100,
      },
      gamesPlayed: {
        "drag-drop": 6,
        "spelling-quiz": 5,
        "word-race": 4,
        "word-search": 3,
        "image-word": 4,
        "crossword": 2,
        "math": 5,
        "math-portugues": 4,
      },
      totalPoints: 740,
      audioEnabled: false,
    },
    {
      id: "student-6",
      name: "Enzo Alves",
      email: "enzo@escola.com",
      password: "123",
      teacherId: "teacher-1",
      turmaId: "turma-2",
      scores: {
        "drag-drop": 40,
        "spelling-quiz": 30,
        "word-race": 40,
        "math": 50,
      },
      gamesPlayed: {
        "drag-drop": 1,
        "spelling-quiz": 1,
        "word-race": 1,
        "math": 1,
      },
      totalPoints: 95,
      audioEnabled: true,
    },
  ];

  // Gerar 23 sessões espalhadas nos últimos 12 dias
  const sessions: GameSession[] = [];
  const games = ["drag-drop", "spelling-quiz", "word-race", "word-search", "image-word", "crossword", "math", "math-portugues"];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 23; i++) {
    const student = students[i % students.length];
    const daysAgo = Math.floor((i * 12) / 23);
    const sessionDate = new Date(now - daysAgo * dayMs);
    const dateStr = sessionDate.toISOString().split("T")[0];
    const game = games[i % games.length];
    const score = student.scores[game] || Math.floor(Math.random() * 30 + 70);

    sessions.push({
      id: `session-seed-${i}`,
      studentId: student.id,
      date: dateStr,
      game,
      score,
      timestamp: sessionDate.getTime(),
    });
  }

  saveTeachers([teacher]);
  saveTurmas(turmas);
  saveStudents(students);
  saveSessions(sessions);
  localStorage.setItem(KEY_SEEDED, "true");
}
