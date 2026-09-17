import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Contas de professores do Letter Play. */
export const letterPlayTeachers = mysqlTable("letter_play_teachers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Turmas pertencentes a uma conta de professor. */
export const letterPlayTurmas = mysqlTable("letter_play_turmas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teacherId: varchar("teacherId", { length: 64 }).notNull(),
  year: varchar("year", { length: 32 }).notNull(),
  letter: varchar("letter", { length: 4 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Alunos, progresso e preferências pedagógicas. */
export const letterPlayStudents = mysqlTable("letter_play_students", {
  id: varchar("id", { length: 64 }).primaryKey(),
  teacherId: varchar("teacherId", { length: 64 }).notNull(),
  turmaId: varchar("turmaId", { length: 64 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  scores: text("scores").notNull(),
  gamesPlayed: text("gamesPlayed").notNull(),
  totalPoints: int("totalPoints").notNull().default(0),
  audioEnabled: boolean("audioEnabled").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Histórico de partidas para a aba de histórico do professor. */
export const letterPlaySessions = mysqlTable("letter_play_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  studentId: varchar("studentId", { length: 64 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  game: varchar("game", { length: 64 }).notNull(),
  score: int("score").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});
