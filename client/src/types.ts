export interface Teacher {
  id: string           // "teacher-{timestamp}"
  name: string
  email: string
  password: string     // texto puro, sem hash
}

export interface Student {
  id: string           // "student-{timestamp}-{random}"
  name: string
  email: string
  password: string
  teacherId: string
  turmaId: string
  scores: Record<string, number>      // chave do jogo → melhor pontuação (0-100)
  gamesPlayed: Record<string, number> // chave do jogo → total de partidas
  totalPoints: number                 // XP acumulado
  audioEnabled: boolean               // narração em voz alta ativada pelo professor
}

export interface Turma {
  id: string           // "turma-{timestamp}"
  teacherId: string
  year: string         // "3º Ano"
  letter: string       // "A", "B", "C", "D" ou "E"
}

export interface GameSession {
  id: string
  studentId: string
  date: string         // "YYYY-MM-DD"
  game: string         // chave do jogo
  score: number        // 0-100
  timestamp: number    // Date.now()
}

export type Screen =
  | "home"
  | "teacher-login"
  | "teacher-register"
  | "teacher-dashboard"
  | "student-login"
  | "student-hub"
  | "game-drag-drop"
  | "game-spelling-quiz"
  | "game-word-race"
  | "game-word-search"
  | "game-image-word"
  | "game-crossword"
  | "game-math"
  | "game-drawing"
  | "game-math-portugues"
