import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  letterPlaySessions,
  letterPlayStudents,
  letterPlayTeachers,
  letterPlayTurmas,
} from "../drizzle/schema";
import { getDb } from "./db";
import { publicProcedure, router } from "./_core/trpc";

const scrypt = promisify(scryptCallback);

const teacherInput = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(3).max(200),
});

const teacherIdInput = z.object({ teacherId: z.string().min(1) });
const studentIdInput = z.object({ studentId: z.string().min(1) });

const studentInput = z.object({
  teacherId: z.string().min(1),
  turmaId: z.string().min(1),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(3).max(200),
});

const updateStudentInput = studentInput.extend({ id: z.string().min(1) });

const turmaInput = z.object({
  teacherId: z.string().min(1),
  year: z.string().trim().min(1).max(32),
  letter: z.string().trim().min(1).max(4),
});

const scoreInput = z.object({
  studentId: z.string().min(1),
  game: z.string().min(1).max(64),
  score: z.number().int().min(0).max(100),
  xp: z.number().int().min(0).max(10000),
});

const legacyTeacherInput = z.object({
  teacher: z.object({ id: z.string(), name: z.string(), email: z.string().email(), password: z.string() }),
  turmas: z.array(z.object({ id: z.string(), teacherId: z.string(), year: z.string(), letter: z.string() })),
  students: z.array(z.object({
    id: z.string(), name: z.string(), email: z.string().email(), password: z.string(), teacherId: z.string(), turmaId: z.string(),
    scores: z.record(z.string(), z.number()), gamesPlayed: z.record(z.string(), z.number()), totalPoints: z.number(), audioEnabled: z.boolean(),
  })),
  sessions: z.array(z.object({ id: z.string(), studentId: z.string(), date: z.string(), game: z.string(), score: z.number(), timestamp: z.number() })),
});

function publicTeacher(row: typeof letterPlayTeachers.$inferSelect) {
  return { id: row.id, name: row.name, email: row.email, password: "" };
}

function parseRecord(value: string): Record<string, number> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function publicStudent(row: typeof letterPlayStudents.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: "",
    teacherId: row.teacherId,
    turmaId: row.turmaId,
    scores: parseRecord(row.scores),
    gamesPlayed: parseRecord(row.gamesPlayed),
    totalPoints: row.totalPoints,
    audioEnabled: Boolean(row.audioEnabled),
  };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  return db;
}

export const letterPlayRouter = router({
  teacherRegister: publicProcedure.input(teacherInput).mutation(async ({ input }) => {
    const db = await requireDb();
    const existing = await db.select().from(letterPlayTeachers).where(eq(letterPlayTeachers.email, input.email)).limit(1);
    if (existing.length) throw new Error("Este email já está cadastrado.");
    const row = { id: `teacher-${randomUUID()}`, name: input.name, email: input.email, passwordHash: await hashPassword(input.password), createdAt: new Date() };
    await db.insert(letterPlayTeachers).values(row);
    return publicTeacher(row);
  }),

  importLegacyTeacher: publicProcedure.input(legacyTeacherInput).mutation(async ({ input }) => {
    const db = await requireDb();
    const existingTeacher = await db.select().from(letterPlayTeachers).where(eq(letterPlayTeachers.email, input.teacher.email.toLowerCase())).limit(1);
    const teacher = existingTeacher[0] ?? {
      id: input.teacher.id,
      name: input.teacher.name,
      email: input.teacher.email.toLowerCase(),
      passwordHash: await hashPassword(input.teacher.password || "123"),
      createdAt: new Date(),
    };
    if (!existingTeacher[0]) await db.insert(letterPlayTeachers).values(teacher);

    for (const turma of input.turmas) {
      const found = await db.select({ id: letterPlayTurmas.id }).from(letterPlayTurmas).where(eq(letterPlayTurmas.id, turma.id)).limit(1);
      if (!found[0]) await db.insert(letterPlayTurmas).values({ ...turma, teacherId: teacher.id, createdAt: new Date() });
    }
    for (const student of input.students) {
      const found = await db.select({ id: letterPlayStudents.id }).from(letterPlayStudents).where(eq(letterPlayStudents.email, student.email.toLowerCase())).limit(1);
      if (!found[0]) await db.insert(letterPlayStudents).values({
        id: student.id,
        teacherId: teacher.id,
        turmaId: student.turmaId,
        name: student.name,
        email: student.email.toLowerCase(),
        passwordHash: await hashPassword(student.password || "123"),
        scores: JSON.stringify(student.scores || {}),
        gamesPlayed: JSON.stringify(student.gamesPlayed || {}),
        totalPoints: student.totalPoints || 0,
        audioEnabled: student.audioEnabled,
        createdAt: new Date(),
      });
    }
    for (const session of input.sessions) {
      const found = await db.select({ id: letterPlaySessions.id }).from(letterPlaySessions).where(eq(letterPlaySessions.id, session.id)).limit(1);
      if (!found[0]) await db.insert(letterPlaySessions).values(session);
    }
    return publicTeacher(teacher);
  }),

  teacherLogin: publicProcedure.input(z.object({ email: teacherInput.shape.email, password: z.string().min(1) })).mutation(async ({ input }) => {
    const db = await requireDb();
    const rows = await db.select().from(letterPlayTeachers).where(eq(letterPlayTeachers.email, input.email)).limit(1);
    if (!rows[0] || !(await verifyPassword(input.password, rows[0].passwordHash))) throw new Error("Email ou senha incorretos.");
    return publicTeacher(rows[0]);
  }),

  teacherData: publicProcedure.input(teacherIdInput).query(async ({ input }) => {
    const db = await requireDb();
    const teacherRows = await db.select().from(letterPlayTeachers).where(eq(letterPlayTeachers.id, input.teacherId)).limit(1);
    if (!teacherRows[0]) throw new Error("Professor não encontrado.");
    const turmas = await db.select().from(letterPlayTurmas).where(eq(letterPlayTurmas.teacherId, input.teacherId));
    const studentRows = await db.select().from(letterPlayStudents).where(eq(letterPlayStudents.teacherId, input.teacherId));
    const studentIds = studentRows.map((student) => student.id);
    const sessions = studentIds.length
      ? await db.select().from(letterPlaySessions).where(inArray(letterPlaySessions.studentId, studentIds))
      : [];
    return {
      teacher: publicTeacher(teacherRows[0]),
      turmas: turmas.map(({ id, teacherId, year, letter }) => ({ id, teacherId, year, letter })),
      students: studentRows.map(publicStudent),
      sessions,
    };
  }),

  createTurma: publicProcedure.input(turmaInput).mutation(async ({ input }) => {
    const db = await requireDb();
    const teacher = await db.select({ id: letterPlayTeachers.id }).from(letterPlayTeachers).where(eq(letterPlayTeachers.id, input.teacherId)).limit(1);
    if (!teacher[0]) throw new Error("Professor não encontrado.");
    const row = { id: `turma-${randomUUID()}`, ...input };
    await db.insert(letterPlayTurmas).values(row);
    return { id: row.id, teacherId: row.teacherId, year: row.year, letter: row.letter };
  }),

  deleteTurma: publicProcedure.input(z.object({ teacherId: z.string().min(1), turmaId: z.string().min(1) })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.delete(letterPlayStudents).where(and(eq(letterPlayStudents.teacherId, input.teacherId), eq(letterPlayStudents.turmaId, input.turmaId)));
    await db.delete(letterPlayTurmas).where(and(eq(letterPlayTurmas.teacherId, input.teacherId), eq(letterPlayTurmas.id, input.turmaId)));
    return { success: true } as const;
  }),

  createStudent: publicProcedure.input(studentInput).mutation(async ({ input }) => {
    const db = await requireDb();
    const turma = await db.select({ id: letterPlayTurmas.id }).from(letterPlayTurmas).where(and(eq(letterPlayTurmas.id, input.turmaId), eq(letterPlayTurmas.teacherId, input.teacherId))).limit(1);
    if (!turma[0]) throw new Error("Turma não encontrada.");
    const existing = await db.select({ id: letterPlayStudents.id }).from(letterPlayStudents).where(eq(letterPlayStudents.email, input.email)).limit(1);
    if (existing.length) throw new Error("Este email de aluno já está cadastrado.");
    const row = {
      id: `student-${randomUUID()}`,
      teacherId: input.teacherId,
      turmaId: input.turmaId,
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      scores: "{}",
      gamesPlayed: "{}",
      totalPoints: 0,
      audioEnabled: true,
      createdAt: new Date(),
    };
    await db.insert(letterPlayStudents).values(row);
    return publicStudent(row);
  }),

  updateStudent: publicProcedure.input(updateStudentInput).mutation(async ({ input }) => {
    const db = await requireDb();
    const rows = await db.select().from(letterPlayStudents).where(and(eq(letterPlayStudents.id, input.id), eq(letterPlayStudents.teacherId, input.teacherId))).limit(1);
    if (!rows[0]) throw new Error("Aluno não encontrado.");
    const update: Partial<typeof letterPlayStudents.$inferInsert> = { name: input.name, email: input.email, turmaId: input.turmaId };
    if (input.password) update.passwordHash = await hashPassword(input.password);
    await db.update(letterPlayStudents).set(update).where(eq(letterPlayStudents.id, input.id));
    return publicStudent({ ...rows[0], ...update, passwordHash: update.passwordHash ?? rows[0].passwordHash });
  }),

  deleteStudent: publicProcedure.input(z.object({ teacherId: z.string().min(1), studentId: z.string().min(1) })).mutation(async ({ input }) => {
    const db = await requireDb();
    await db.delete(letterPlaySessions).where(eq(letterPlaySessions.studentId, input.studentId));
    await db.delete(letterPlayStudents).where(and(eq(letterPlayStudents.teacherId, input.teacherId), eq(letterPlayStudents.id, input.studentId)));
    return { success: true } as const;
  }),

  toggleStudentAudio: publicProcedure.input(z.object({ teacherId: z.string().min(1), studentId: z.string().min(1) })).mutation(async ({ input }) => {
    const db = await requireDb();
    const rows = await db.select().from(letterPlayStudents).where(and(eq(letterPlayStudents.teacherId, input.teacherId), eq(letterPlayStudents.id, input.studentId))).limit(1);
    if (!rows[0]) throw new Error("Aluno não encontrado.");
    const audioEnabled = !Boolean(rows[0].audioEnabled);
    await db.update(letterPlayStudents).set({ audioEnabled }).where(eq(letterPlayStudents.id, input.studentId));
    return audioEnabled;
  }),

  studentLogin: publicProcedure.input(z.object({ email: z.string().trim().email().transform((value) => value.toLowerCase()), password: z.string().min(1) })).mutation(async ({ input }) => {
    const db = await requireDb();
    const rows = await db.select().from(letterPlayStudents).where(eq(letterPlayStudents.email, input.email)).limit(1);
    if (!rows[0] || !(await verifyPassword(input.password, rows[0].passwordHash))) throw new Error("Email ou senha incorretos.");
    return publicStudent(rows[0]);
  }),

  saveScore: publicProcedure.input(scoreInput).mutation(async ({ input }) => {
    const db = await requireDb();
    const rows = await db.select().from(letterPlayStudents).where(eq(letterPlayStudents.id, input.studentId)).limit(1);
    if (!rows[0]) throw new Error("Aluno não encontrado.");
    const scores = parseRecord(rows[0].scores);
    const gamesPlayed = parseRecord(rows[0].gamesPlayed);
    scores[input.game] = Math.max(scores[input.game] || 0, input.score);
    gamesPlayed[input.game] = (gamesPlayed[input.game] || 0) + 1;
    await db.update(letterPlayStudents).set({ scores: JSON.stringify(scores), gamesPlayed: JSON.stringify(gamesPlayed), totalPoints: rows[0].totalPoints + input.xp }).where(eq(letterPlayStudents.id, input.studentId));
    const now = Date.now();
    await db.insert(letterPlaySessions).values({ id: `session-${randomUUID()}`, studentId: input.studentId, date: new Date(now).toISOString().slice(0, 10), game: input.game, score: input.score, timestamp: now });
    return { ...publicStudent({ ...rows[0], scores: JSON.stringify(scores), gamesPlayed: JSON.stringify(gamesPlayed), totalPoints: rows[0].totalPoints + input.xp }), synced: true };
  }),
});
