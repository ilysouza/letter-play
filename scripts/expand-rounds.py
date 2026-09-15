from pathlib import Path

root = Path('/home/ubuntu/letter-play/client/src')

store = root / 'store.ts'
text = store.read_text()
needle = 'export function updateStudentScore(studentId: string, game: string, score: number, xp: number): void {'
insert = '''export function getStudentRound(studentId: string, game: string, poolLength: number): number {
  if (poolLength <= 0) return 0;
  const student = getStoredStudents().find((s) => s.id === studentId);
  return (student?.gamesPlayed?.[game] || 0) % poolLength;
}

'''
if insert not in text:
    text = text.replace(needle, insert + needle)
store.write_text(text)

types = root / 'types.ts'
text = types.read_text().replace('  | "game-math-portugues"', '  | "game-math-portugues"\n  | "game-letter-hunt"')
types.write_text(text)

daily = root / 'dailyWords.ts'
text = daily.read_text()
text = text.replace('export function getDailyDragWords(): DragWordItem[] {\n  return shuffle(ALL_DRAG_WORDS).slice(0, 5);\n}', '''export function getDailyDragWords(round = 0): DragWordItem[] {
  const start = (round * 5) % ALL_DRAG_WORDS.length;
  const rotated = [...ALL_DRAG_WORDS.slice(start), ...ALL_DRAG_WORDS.slice(0, start)];
  return rotated.slice(0, 5);
}''')
text = text.replace('export function getDailyQuizQuestions(): QuizQuestion[] {\n  const chosenSet = pickSet(QUIZ_POOL);', 'export function getDailyQuizQuestions(round = getDayIndex()): QuizQuestion[] {\n  const chosenSet = QUIZ_POOL[((round % QUIZ_POOL.length) + QUIZ_POOL.length) % QUIZ_POOL.length];')
text = text.replace('export function getDailyRaceWords() {\n  return shuffle(ALL_RACE_WORDS).slice(0, 6);\n}', '''export function getDailyRaceWords(round = 0) {
  const start = (round * 6) % ALL_RACE_WORDS.length;
  const rotated = [...ALL_RACE_WORDS.slice(start), ...ALL_RACE_WORDS.slice(0, start)];
  return rotated.slice(0, 6);
}''')
text = text.replace('export function getDailySearchPuzzle(): SearchPuzzle {\n  return pickSet(SEARCH_POOL);\n}', 'export function getDailySearchPuzzle(round = getDayIndex()): SearchPuzzle {\n  return SEARCH_POOL[((round % SEARCH_POOL.length) + SEARCH_POOL.length) % SEARCH_POOL.length];\n}')
text = text.replace('export function getDailyImagePairs(): ImagePair[] {\n  return pickSet(IMAGE_POOL);\n}', 'export function getDailyImagePairs(round = getDayIndex()): ImagePair[] {\n  return IMAGE_POOL[((round % IMAGE_POOL.length) + IMAGE_POOL.length) % IMAGE_POOL.length];\n}')
text = text.replace('export function getDailyCrossword(): CrosswordPuzzle {\n  return pickSet(CROSSWORD_POOL);\n}', 'export function getDailyCrossword(round = getDayIndex()): CrosswordPuzzle {\n  return CROSSWORD_POOL[((round % CROSSWORD_POOL.length) + CROSSWORD_POOL.length) % CROSSWORD_POOL.length];\n}')
text = text.replace('  "math-portugues": {', '  "letter-hunt": { name: "Caça à Letra", emoji: "🔎", desc: "Observe a imagem e encontre a letra inicial." },\n  "math-portugues": {')
daily.write_text(text)

# Pass student-specific round to content selectors.
replacements = {
('pages/games/DragDropGame.tsx', 'import { updateStudentScore } from "@/store";', 'import { updateStudentScore, getStudentRound } from "@/store";', 'getDailyDragWords()', 'getDailyDragWords(getStudentRound(student.id, "drag-drop", Math.ceil(30 / 5)))'),
('pages/games/SpellingQuizGame.tsx', 'import { updateStudentScore } from "@/store";', 'import { updateStudentScore, getStudentRound } from "@/store";', 'getDailyQuizQuestions()', 'getDailyQuizQuestions(getStudentRound(student.id, "spelling-quiz", 5))'),
('pages/games/WordRaceGame.tsx', 'import { updateStudentScore } from "@/store";', 'import { updateStudentScore, getStudentRound } from "@/store";', 'getDailyRaceWords()', 'getDailyRaceWords(getStudentRound(student.id, "word-race", Math.ceil(31 / 6)))'),
('pages/games/WordSearchGame.tsx', 'import { updateStudentScore } from "@/store";', 'import { updateStudentScore, getStudentRound } from "@/store";', 'getDailySearchPuzzle()', 'getDailySearchPuzzle(getStudentRound(student.id, "word-search", 3))'),
('pages/games/ImageWordGame.tsx', 'import { updateStudentScore } from "@/store";', 'import { updateStudentScore, getStudentRound } from "@/store";', 'getDailyImagePairs()', 'getDailyImagePairs(getStudentRound(student.id, "image-word", 5))'),
('pages/games/CrosswordGame.tsx', 'import { updateStudentScore } from "@/store";', 'import { updateStudentScore, getStudentRound } from "@/store";', 'getDailyCrossword()', 'getDailyCrossword(getStudentRound(student.id, "crossword", 4))'),
}
for rel, oldimp, newimp, oldcall, newcall in replacements:
    path = root / rel
    t = path.read_text().replace(oldimp, newimp).replace(oldcall, newcall)
    path.write_text(t)
print('round utilities and per-student selectors updated')
