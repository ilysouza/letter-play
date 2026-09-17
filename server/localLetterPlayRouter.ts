import { randomUUID } from "node:crypto";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { hashPassword, verifyPassword } from "./letterPlayRouter";
import { readLocalData, updateLocalData, type LocalStudent, type LocalTeacher } from "./localStore";

const teacherInput = z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().transform((v) => v.toLowerCase()), password: z.string().min(3).max(200) });
const studentInput = z.object({ teacherId: z.string().min(1), turmaId: z.string().min(1), name: z.string().trim().min(2).max(160), email: z.string().trim().email().transform((v) => v.toLowerCase()), password: z.string().min(3).max(200) });
const scoreInput = z.object({ studentId: z.string().min(1), game: z.string().min(1).max(64), score: z.number().int().min(0).max(100), xp: z.number().int().min(0).max(10000) });
const legacyInput = z.object({
  teacher: z.object({ id: z.string(), name: z.string(), email: z.string().email(), password: z.string() }),
  turmas: z.array(z.object({ id: z.string(), teacherId: z.string(), year: z.string(), letter: z.string() })),
  students: z.array(z.object({ id: z.string(), name: z.string(), email: z.string().email(), password: z.string(), teacherId: z.string(), turmaId: z.string(), scores: z.record(z.string(), z.number()), gamesPlayed: z.record(z.string(), z.number()), totalPoints: z.number(), audioEnabled: z.boolean() })),
  sessions: z.array(z.object({ id: z.string(), studentId: z.string(), date: z.string(), game: z.string(), score: z.number(), timestamp: z.number() })),
});
const publicTeacher = (row: LocalTeacher) => ({ id: row.id, name: row.name, email: row.email, password: "" });
const publicStudent = (row: LocalStudent) => ({ id: row.id, name: row.name, email: row.email, password: "", teacherId: row.teacherId, turmaId: row.turmaId, scores: row.scores, gamesPlayed: row.gamesPlayed, totalPoints: row.totalPoints, audioEnabled: row.audioEnabled });

export const localLetterPlayRouter = router({
  teacherRegister: publicProcedure.input(teacherInput).mutation(async ({ input }) => {
    const data = await readLocalData();
    if (data.teachers.some((teacher) => teacher.email === input.email)) throw new Error("Este email já está cadastrado.");
    const row: LocalTeacher = { id: `teacher-${randomUUID()}`, name: input.name, email: input.email, passwordHash: await hashPassword(input.password), createdAt: new Date().toISOString() };
    await updateLocalData((next) => { next.teachers.push(row); });
    return publicTeacher(row);
  }),

  importLegacyTeacher: publicProcedure.input(legacyInput).mutation(async ({ input }) => {
    await updateLocalData(async (data) => {
      let teacher = data.teachers.find((row) => row.email === input.teacher.email.toLowerCase());
      if (!teacher) {
        teacher = { id: input.teacher.id, name: input.teacher.name, email: input.teacher.email.toLowerCase(), passwordHash: await hashPassword(input.teacher.password || "123"), createdAt: new Date().toISOString() };
        data.teachers.push(teacher);
      }
      for (const turma of input.turmas) if (!data.turmas.some((row) => row.id === turma.id)) data.turmas.push({ ...turma, teacherId: teacher.id });
      for (const student of input.students) if (!data.students.some((row) => row.email === student.email.toLowerCase())) data.students.push({ id: student.id, name: student.name, email: student.email.toLowerCase(), passwordHash: await hashPassword(student.password || "123"), teacherId: teacher.id, turmaId: student.turmaId, scores: student.scores || {}, gamesPlayed: student.gamesPlayed || {}, totalPoints: student.totalPoints || 0, audioEnabled: student.audioEnabled, createdAt: new Date().toISOString() });
      for (const session of input.sessions) if (!data.sessions.some((row) => row.id === session.id)) data.sessions.push(session);
    });
    const data = await readLocalData();
    return publicTeacher(data.teachers.find((row) => row.email === input.teacher.email.toLowerCase())!);
  }),

  teacherLogin: publicProcedure.input(z.object({ email: z.string().trim().email().transform((v) => v.toLowerCase()), password: z.string().min(1) })).mutation(async ({ input }) => {
    const data = await readLocalData();
    const teacher = data.teachers.find((row) => row.email === input.email);
    if (!teacher || !(await verifyPassword(input.password, teacher.passwordHash))) throw new Error("Email ou senha incorretos.");
    return publicTeacher(teacher);
  }),

  teacherData: publicProcedure.input(z.object({ teacherId: z.string().min(1) })).query(async ({ input }) => {
    const data = await readLocalData();
    const teacher = data.teachers.find((row) => row.id === input.teacherId);
    if (!teacher) throw new Error("Professor não encontrado.");
    const students = data.students.filter((row) => row.teacherId === input.teacherId);
    const studentIds = new Set(students.map((row) => row.id));
    return { teacher: publicTeacher(teacher), turmas: data.turmas.filter((row) => row.teacherId === input.teacherId), students: students.map(publicStudent), sessions: data.sessions.filter((row) => studentIds.has(row.studentId)) };
  }),

  createTurma: publicProcedure.input(z.object({ teacherId: z.string().min(1), year: z.string().trim().min(1).max(32), letter: z.string().trim().min(1).max(4) })).mutation(async ({ input }) => {
    const data = await readLocalData();
    if (!data.teachers.some((row) => row.id === input.teacherId)) throw new Error("Professor não encontrado.");
    const row = { id: `turma-${randomUUID()}`, ...input };
    await updateLocalData((next) => { next.turmas.push(row); });
    return row;
  }),

  deleteTurma: publicProcedure.input(z.object({ teacherId: z.string(), turmaId: z.string() })).mutation(async ({ input }) => {
    await updateLocalData((data) => { const ids = new Set(data.students.filter((row) => row.teacherId === input.teacherId && row.turmaId === input.turmaId).map((row) => row.id)); data.students = data.students.filter((row) => !ids.has(row.id)); data.sessions = data.sessions.filter((row) => !ids.has(row.studentId)); data.turmas = data.turmas.filter((row) => !(row.teacherId === input.teacherId && row.id === input.turmaId)); });
    return { success: true } as const;
  }),

  createStudent: publicProcedure.input(studentInput).mutation(async ({ input }) => {
    const data = await readLocalData();
    if (!data.turmas.some((row) => row.id === input.turmaId && row.teacherId === input.teacherId)) throw new Error("Turma não encontrada.");
    if (data.students.some((row) => row.email === input.email)) throw new Error("Este email de aluno já está cadastrado.");
    const row: LocalStudent = { id: `student-${randomUUID()}`, teacherId: input.teacherId, turmaId: input.turmaId, name: input.name, email: input.email, passwordHash: await hashPassword(input.password), scores: {}, gamesPlayed: {}, totalPoints: 0, audioEnabled: true, createdAt: new Date().toISOString() };
    await updateLocalData((next) => { next.students.push(row); });
    return publicStudent(row);
  }),

  updateStudent: publicProcedure.input(studentInput.extend({ id: z.string() })).mutation(async ({ input }) => {
    let result!: LocalStudent;
    await updateLocalData(async (data) => { const row = data.students.find((student) => student.id === input.id && student.teacherId === input.teacherId); if (!row) throw new Error("Aluno não encontrado."); row.name = input.name; row.email = input.email; row.turmaId = input.turmaId; if (input.password) row.passwordHash = await hashPassword(input.password); result = row; });
    return publicStudent(result);
  }),

  deleteStudent: publicProcedure.input(z.object({ teacherId: z.string(), studentId: z.string() })).mutation(async ({ input }) => { await updateLocalData((data) => { data.students = data.students.filter((row) => !(row.id === input.studentId && row.teacherId === input.teacherId)); data.sessions = data.sessions.filter((row) => row.studentId !== input.studentId); }); return { success: true } as const; }),

  toggleStudentAudio: publicProcedure.input(z.object({ teacherId: z.string(), studentId: z.string() })).mutation(async ({ input }) => { let enabled = true; await updateLocalData((data) => { const row = data.students.find((student) => student.id === input.studentId && student.teacherId === input.teacherId); if (!row) throw new Error("Aluno não encontrado."); row.audioEnabled = !row.audioEnabled; enabled = row.audioEnabled; }); return enabled; }),

  studentLogin: publicProcedure.input(z.object({ email: z.string().trim().email().transform((v) => v.toLowerCase()), password: z.string().min(1) })).mutation(async ({ input }) => { const data = await readLocalData(); const student = data.students.find((row) => row.email === input.email); if (!student || !(await verifyPassword(input.password, student.passwordHash))) throw new Error("Email ou senha incorretos."); return publicStudent(student); }),

  saveScore: publicProcedure.input(scoreInput).mutation(async ({ input }) => { let result!: LocalStudent; await updateLocalData((data) => { const student = data.students.find((row) => row.id === input.studentId); if (!student) throw new Error("Aluno não encontrado."); student.scores[input.game] = Math.max(student.scores[input.game] || 0, input.score); student.gamesPlayed[input.game] = (student.gamesPlayed[input.game] || 0) + 1; student.totalPoints += input.xp; result = student; data.sessions.push({ id: `session-${randomUUID()}`, studentId: student.id, date: new Date().toISOString().slice(0, 10), game: input.game, score: input.score, timestamp: Date.now() }); }); return { ...publicStudent(result), synced: true }; }),
});
