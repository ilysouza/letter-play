import { Teacher, Student, Turma, GameSession } from "./types";
import { cloudClient } from "./cloud";

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

export async function registerTeacherOnline(name: string, email: string, password: string): Promise<Teacher> {
  const teacher = await cloudClient.letterPlay.teacherRegister.mutate({ name, email, password });
  saveTeachers([teacher, ...getStoredTeachers().filter((item) => item.id !== teacher.id)]);
  return teacher;
}

export async function loginTeacherOnline(email: string, password: string): Promise<Teacher> {
  try {
    const teacher = await cloudClient.letterPlay.teacherLogin.mutate({ email, password });
    saveTeachers([teacher, ...getStoredTeachers().filter((item) => item.id !== teacher.id)]);
    return teacher;
  } catch (error) {
    const localTeacher = getStoredTeachers().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
    if (!localTeacher) throw error;
    const migrated = await cloudClient.letterPlay.importLegacyTeacher.mutate({
      teacher: localTeacher,
      turmas: getStoredTurmas().filter((item) => item.teacherId === localTeacher.id),
      students: getStoredStudents().filter((item) => item.teacherId === localTeacher.id),
      sessions: getStoredSessions(),
    });
    saveTeachers([migrated, ...getStoredTeachers().filter((item) => item.id !== migrated.id)]);
    return migrated;
  }
}

export async function loginStudentOnline(email: string, password: string): Promise<Student> {
  const student = await cloudClient.letterPlay.studentLogin.mutate({ email, password });
  saveStudents([student, ...getStoredStudents().filter((item) => item.id !== student.id)]);
  return student;
}

export async function fetchTeacherDataOnline(teacherId: string) {
  const data = await cloudClient.letterPlay.teacherData.query({ teacherId });
  saveTurmas(data.turmas);
  saveStudents([...data.students, ...getStoredStudents().filter((item) => item.teacherId !== teacherId)]);
  saveSessions([...data.sessions, ...getStoredSessions().filter((item) => !data.students.some((student) => student.id === item.studentId))]);
  return data;
}

export async function createTurmaOnline(input: Omit<Turma, "id">): Promise<Turma> {
  const turma = await cloudClient.letterPlay.createTurma.mutate(input);
  saveTurmas([turma, ...getStoredTurmas().filter((item) => item.id !== turma.id)]);
  return turma;
}

export async function deleteTurmaOnline(teacherId: string, turmaId: string): Promise<void> {
  await cloudClient.letterPlay.deleteTurma.mutate({ teacherId, turmaId });
  deleteTurma(turmaId);
}

export async function createStudentOnline(input: Omit<Student, "id" | "scores" | "gamesPlayed" | "totalPoints" | "audioEnabled">): Promise<Student> {
  const student = await cloudClient.letterPlay.createStudent.mutate({ ...input });
  saveStudents([student, ...getStoredStudents().filter((item) => item.id !== student.id)]);
  return student;
}

export async function updateStudentOnline(input: Omit<Student, "scores" | "gamesPlayed" | "totalPoints" | "audioEnabled">): Promise<Student> {
  const student = await cloudClient.letterPlay.updateStudent.mutate(input);
  saveStudents([student, ...getStoredStudents().filter((item) => item.id !== student.id)]);
  return student;
}

export async function deleteStudentOnline(teacherId: string, studentId: string): Promise<void> {
  await cloudClient.letterPlay.deleteStudent.mutate({ teacherId, studentId });
  deleteStudent(studentId);
}

export async function toggleStudentAudioOnline(teacherId: string, studentId: string): Promise<boolean> {
  const enabled = await cloudClient.letterPlay.toggleStudentAudio.mutate({ teacherId, studentId });
  const students = getStoredStudents().map((student) => student.id === studentId ? { ...student, audioEnabled: enabled } : student);
  saveStudents(students);
  return enabled;
}

// Atualizar pontuação e XP do aluno após uma partida
export function getStudentRound(studentId: string, game: string, poolLength: number): number {
  if (poolLength <= 0) return 0;
  const student = getStoredStudents().find((s) => s.id === studentId);
  return (student?.gamesPlayed?.[game] || 0) % poolLength;
}

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

  void cloudClient.letterPlay.saveScore.mutate({ studentId, game, score, xp }).then((student) => {
    const current = getStoredStudents();
    saveStudents([student, ...current.filter((item) => item.id !== student.id)]);
  }).catch((error) => {
    console.warn("[Letter Play] Não foi possível sincronizar a pontuação agora.", error);
  });
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
    name: "Profª. Silvana",
    email: "silvana@escola.com",
    password: "123",
  };

  const turmas: Turma[] = [
    { id: "turma-1", teacherId: "teacher-1", year: "1º Ano", letter: "A" },
  ];

  const students: Student[] = [
    {
  id: "student-1",
  name: "Amaya Santos Sepulveda",
  email: "amaya@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-2",
  name: "Angelo Ciccillo Gomes Cogliatti",
  email: "angelo@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-3",
  name: "Anna Alice Pereira Sena",
  email: "anna@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-4",
  name: "ANTHONY REZENDE SANT ANNA",
  email: "anthony@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-5",
  name: "Anthony Zaia Carvelli",
  email: "anthony@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-6",
  name: "Arthur Miguel Cáceres dos Santos",
  email: "arthur@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-7",
  name: "BENÍCIO MAIA FERREIRA",
  email: "benicio@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-8",
  name: "Benício Zaia Carvelli",
  email: "benicio@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-9",
  name: "BENJAMIM SALES CABRAL",
  email: "benjamim@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-10",
  name: "Benjamin Luz Araujo",
  email: "benjamin@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-11",
  name: "Bernardo Alves Mathias de Oliveira",
  email: "bernardo@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-12",
  name: "Brendha Araujo Marcondes",
  email: "brendha@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-13",
  name: "Cecília Gomes Bezerra",
  email: "cecilia@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-14",
  name: "Cecília Raiol Selbach",
  email: "cecilia@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-15",
  name: "Cecília Ziemba Vera Sarraipa Brescancin",
  email: "cecilia@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-16",
  name: "Davi de Souza Belentani Teixeira",
  email: "davi@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-17",
  name: "DAVI SOUZA VENTURA",
  email: "davi@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-18",
  name: "Emanuelly Gomes Correia",
  email: "emanuelly@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-19",
  name: "GABRIEL HENRIQUE DA SILVA BARROS",
  email: "gabriel@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-20",
  name: "HELENA FERREIRA SERRA",
  email: "helena@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-21",
  name: "Heloísa Troiani Costa",
  email: "heloisa@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-22",
  name: "Henrique Fernandes Inoue Hamada",
  email: "henrique@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-23",
  name: "ISAQUE FERREIRA SANSAO",
  email: "isaque@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-24",
  name: "Liz Farina Dias",
  email: "liz@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-25",
  name: "Lorena Vitoria Bispo Sales Pereira",
  email: "lorena@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-26",
  name: "MARIA ALICE LIMA DE SOUZA",
  email: "maria@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-27",
  name: "MARIA CLARA VILHALBA LIMA FERREIRA",
  email: "maria@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-28",
  name: "Mariah Zinezzi Albuquerque Alves",
  email: "mariah@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-29",
  name: "Paola Bezerra de Oliveira",
  email: "paola@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-30",
  name: "PEDRO HENRIQUE LOPES DA SILVA",
  email: "pedro@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-31",
  name: "SOFIA COCHI OLIVEIRA",
  email: "sofia@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-32",
  name: "TAINA COCHI OLIVEIRA",
  email: "taina@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-33",
  name: "Helena Oliveira Marques",
  email: "helena@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
  audioEnabled: true,
},
{
  id: "student-34",
  name: "Lunna Catarina dos Santos",
  email: "lunna@sesi.com",
  password: "123",
  teacherId: "teacher-1",
  turmaId: "turma-1",
  scores: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  gamesPlayed: {
    "drag-drop": 0,
    "spelling-quiz": 0,
    "word-race": 0,
    "word-search": 0,
    "image-word": 0,
    "crossword": 0,
    "math": 0,
    "math-portugues": 0,
  },
  totalPoints: 0,
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
