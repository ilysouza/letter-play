import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type LocalTeacher = { id: string; name: string; email: string; passwordHash: string; createdAt: string };
export type LocalTurma = { id: string; teacherId: string; year: string; letter: string };
export type LocalStudent = { id: string; teacherId: string; turmaId: string; name: string; email: string; passwordHash: string; scores: Record<string, number>; gamesPlayed: Record<string, number>; totalPoints: number; audioEnabled: boolean; createdAt: string };
export type LocalSession = { id: string; studentId: string; date: string; game: string; score: number; timestamp: number };
export type LocalData = { teachers: LocalTeacher[]; turmas: LocalTurma[]; students: LocalStudent[]; sessions: LocalSession[] };

const filePath = path.resolve(process.env.LETTER_PLAY_DATA_FILE || "data/letter-play.json");
let writeQueue: Promise<void> = Promise.resolve();

const emptyData = (): LocalData => ({ teachers: [], turmas: [], students: [], sessions: [] });

export async function readLocalData(): Promise<LocalData> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : [],
      turmas: Array.isArray(parsed.turmas) ? parsed.turmas : [],
      students: Array.isArray(parsed.students) ? parsed.students : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return emptyData();
  }
}

export async function writeLocalData(data: LocalData): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export async function updateLocalData(mutator: (data: LocalData) => void | Promise<void>): Promise<LocalData> {
  let result!: LocalData;
  writeQueue = writeQueue.then(async () => {
    const data = await readLocalData();
    await mutator(data);
    await writeLocalData(data);
    result = data;
  });
  await writeQueue;
  return result;
}

export function getLocalDataPath(): string { return filePath; }
