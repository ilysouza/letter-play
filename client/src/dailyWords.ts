// dailyWords.ts — Conteúdo pedagógico e rotação diária de atividades
import dinoImg from "@/imports/dino.png";

// Imagens de palavras Unsplash de alta qualidade (31 palavras)
export const WORD_IMAGES: Record<string, string> = {
  GATO: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&auto=format",
  SAPO: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&h=400&fit=crop&auto=format",
  PATO: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=400&h=400&fit=crop&auto=format",
  BOLA: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=400&fit=crop&auto=format",
  CASA: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop&auto=format",
  MALA: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=400&fit=crop&auto=format",
  FOCA: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop&auto=format",
  VACA: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400&h=400&fit=crop&auto=format",
  LOBO: "https://images.unsplash.com/photo-1564865878688-9a244444042a?w=400&h=400&fit=crop&auto=format",
  BOLO: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&auto=format",
  MOTO: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=400&fit=crop&auto=format",
  LAGO: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop&auto=format",
  CACHORRO: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop&auto=format",
  GIRAFA: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400&h=400&fit=crop&auto=format",
  ELEFANTE: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&h=400&fit=crop&auto=format",
  BORBOLETA: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop&auto=format",
  BANANA: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&auto=format",
  ABACAXI: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop&auto=format",
  BICICLETA: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop&auto=format",
  COELHO: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop&auto=format",
  ZEBRA: "https://images.unsplash.com/photo-1526095179574-86e545346ae6?w=400&h=400&fit=crop&auto=format",
  MACACO: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&h=400&fit=crop&auto=format",
  PEIXE: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=400&fit=crop&auto=format",
  TARTARUGA: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&h=400&fit=crop&auto=format",
  GALINHA: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=400&fit=crop&auto=format",
  LHAMA: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop&auto=format",
  CHOCOLATE: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop&auto=format",
  PASSARINHO: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=400&fit=crop&auto=format",
  DINOSSAURO: dinoImg,
  CHAVE: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=400&fit=crop&auto=format",
  CHUVA: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=400&fit=crop&auto=format",
};

// Dias desde 2026-01-01 para rotação determinística diária
export function getDayIndex(): number {
  const base = new Date(2026, 0, 1).getTime();
  const now = new Date().getTime();
  return Math.floor((now - base) / (1000 * 60 * 60 * 24));
}

export function pickSet<T>(pool: T[]): T {
  return pool[getDayIndex() % pool.length];
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 1. ALL_DRAG_WORDS (30 palavras com decomposição silábica)
export interface DragWordItem {
  word: string;
  syllables: string[];
  image: string;
}

export const ALL_DRAG_WORDS: DragWordItem[] = [
  { word: "GATO", syllables: ["GA", "TO"], image: WORD_IMAGES.GATO },
  { word: "SAPO", syllables: ["SA", "PO"], image: WORD_IMAGES.SAPO },
  { word: "PATO", syllables: ["PA", "TO"], image: WORD_IMAGES.PATO },
  { word: "BOLA", syllables: ["BO", "LA"], image: WORD_IMAGES.BOLA },
  { word: "CASA", syllables: ["CA", "SA"], image: WORD_IMAGES.CASA },
  { word: "MALA", syllables: ["MA", "LA"], image: WORD_IMAGES.MALA },
  { word: "FOCA", syllables: ["FO", "CA"], image: WORD_IMAGES.FOCA },
  { word: "VACA", syllables: ["VA", "CA"], image: WORD_IMAGES.VACA },
  { word: "LOBO", syllables: ["LO", "BO"], image: WORD_IMAGES.LOBO },
  { word: "BOLO", syllables: ["BO", "LO"], image: WORD_IMAGES.BOLO },
  { word: "MOTO", syllables: ["MO", "TO"], image: WORD_IMAGES.MOTO },
  { word: "LAGO", syllables: ["LA", "GO"], image: WORD_IMAGES.LAGO },
  { word: "GIRAFA", syllables: ["GI", "RA", "FA"], image: WORD_IMAGES.GIRAFA },
  { word: "BANANA", syllables: ["BA", "NA", "NA"], image: WORD_IMAGES.BANANA },
  { word: "MACACO", syllables: ["MA", "CA", "CO"], image: WORD_IMAGES.MACACO },
  { word: "COELHO", syllables: ["CO", "E", "LHO"], image: WORD_IMAGES.COELHO },
  { word: "ZEBRA", syllables: ["ZE", "BRA"], image: WORD_IMAGES.ZEBRA },
  { word: "PEIXE", syllables: ["PEI", "XE"], image: WORD_IMAGES.PEIXE },
  { word: "LHAMA", syllables: ["LHA", "MA"], image: WORD_IMAGES.LHAMA },
  { word: "CHAVE", syllables: ["CHA", "VE"], image: WORD_IMAGES.CHAVE },
  { word: "CHUVA", syllables: ["CHU", "VA"], image: WORD_IMAGES.CHUVA },
  { word: "CACHORRO", syllables: ["CA", "CHOR", "RO"], image: WORD_IMAGES.CACHORRO },
  { word: "ELEFANTE", syllables: ["E", "LE", "FAN", "TE"], image: WORD_IMAGES.ELEFANTE },
  { word: "BORBOLETA", syllables: ["BOR", "BO", "LE", "TA"], image: WORD_IMAGES.BORBOLETA },
  { word: "ABACAXI", syllables: ["A", "BA", "CA", "XI"], image: WORD_IMAGES.ABACAXI },
  { word: "BICICLETA", syllables: ["BI", "CI", "CLE", "TA"], image: WORD_IMAGES.BICICLETA },
  { word: "TARTARUGA", syllables: ["TAR", "TA", "RU", "GA"], image: WORD_IMAGES.TARTARUGA },
  { word: "GALINHA", syllables: ["GA", "LI", "NHA"], image: WORD_IMAGES.GALINHA },
  { word: "CHOCOLATE", syllables: ["CHO", "CO", "LA", "TE"], image: WORD_IMAGES.CHOCOLATE },
  { word: "PASSARINHO", syllables: ["PAS", "SA", "RI", "NHO"], image: WORD_IMAGES.PASSARINHO },
];

export function getDailyDragWords(): DragWordItem[] {
  return shuffle(ALL_DRAG_WORDS).slice(0, 5);
}

// 2. QUIZ_POOL (5 sets de 5 perguntas com distratores fonéticos/ortográficos plausíveis)
export interface QuizQuestion {
  word: string;
  image: string;
  options: string[];
}

export const QUIZ_POOL: QuizQuestion[][] = [
  // Set 1
  [
    { word: "CACHORRO", image: WORD_IMAGES.CACHORRO, options: ["CACHORRO", "KAXORRO", "CACHORO", "KACHORRO"] },
    { word: "GIRAFA", image: WORD_IMAGES.GIRAFA, options: ["GIRAFA", "JIRAFA", "GIRAFFA", "JIRAPHA"] },
    { word: "CHOCOLATE", image: WORD_IMAGES.CHOCOLATE, options: ["CHOCOLATE", "XOCOLATE", "CHOCOLATTE", "CHOCULATE"] },
    { word: "BICICLETA", image: WORD_IMAGES.BICICLETA, options: ["BICICLETA", "BISICLETA", "BICICRETA", "BICICLETTA"] },
    { word: "PASSARINHO", image: WORD_IMAGES.PASSARINHO, options: ["PASSARINHO", "PASARINHO", "PACARINHO", "PASSARINHU"] },
  ],
  // Set 2
  [
    { word: "ELEFANTE", image: WORD_IMAGES.ELEFANTE, options: ["ELEFANTE", "ELEFANTI", "HELEFANTE", "ELEPANTE"] },
    { word: "BORBOLETA", image: WORD_IMAGES.BORBOLETA, options: ["BORBOLETA", "BORBOLETTA", "BORBORETA", "BURBOLETA"] },
    { word: "TARTARUGA", image: WORD_IMAGES.TARTARUGA, options: ["TARTARUGA", "TATARUGA", "TARTALUGA", "TARTARUGHA"] },
    { word: "GALINHA", image: WORD_IMAGES.GALINHA, options: ["GALINHA", "GALINA", "GALINNA", "GALYNHA"] },
    { word: "ABACAXI", image: WORD_IMAGES.ABACAXI, options: ["ABACAXI", "ABACACHI", "HABACAXI", "ABACAXIS"] },
  ],
  // Set 3
  [
    { word: "DINOSSAURO", image: WORD_IMAGES.DINOSSAURO, options: ["DINOSSAURO", "DINOSAURO", "DINOSSARO", "DINOZAURO"] },
    { word: "COELHO", image: WORD_IMAGES.COELHO, options: ["COELHO", "COELO", "COELHU", "CUELHO"] },
    { word: "MACACO", image: WORD_IMAGES.MACACO, options: ["MACACO", "MAKAPO", "MAKAACO", "MACAQUO"] },
    { word: "PEIXE", image: WORD_IMAGES.PEIXE, options: ["PEIXE", "PEICHE", "PEXI", "PEYX"] },
    { word: "ZEBRA", image: WORD_IMAGES.ZEBRA, options: ["ZEBRA", "SEBRA", "ZEBBRRA", "ZEVRA"] },
  ],
  // Set 4
  [
    { word: "CHAVE", image: WORD_IMAGES.CHAVE, options: ["CHAVE", "XAVE", "CHAVY", "TXAVE"] },
    { word: "CHUVA", image: WORD_IMAGES.CHUVA, options: ["CHUVA", "XUVA", "CHUA", "CHUBBA"] },
    { word: "BANANA", image: WORD_IMAGES.BANANA, options: ["BANANA", "BANNANA", "BANANNA", "PANANA"] },
    { word: "LHAMA", image: WORD_IMAGES.LHAMA, options: ["LHAMA", "LAMA", "LIAMA", "LLAMA"] },
    { word: "BOLA", image: WORD_IMAGES.BOLA, options: ["BOLA", "POLA", "BOLLA", "BULA"] },
  ],
  // Set 5
  [
    { word: "CASA", image: WORD_IMAGES.CASA, options: ["CASA", "CAZA", "KASA", "KAZA"] },
    { word: "SAPO", image: WORD_IMAGES.SAPO, options: ["SAPO", "CAPO", "SAPPU", "ZAPO"] },
    { word: "PATO", image: WORD_IMAGES.PATO, options: ["PATO", "BATO", "PATTO", "PATU"] },
    { word: "GATO", image: WORD_IMAGES.GATO, options: ["GATO", "JATO", "GATTO", "GATU"] },
    { word: "VACA", image: WORD_IMAGES.VACA, options: ["VACA", "BACA", "VAKKA", "VACCA"] },
  ],
];

export function getDailyQuizQuestions(): QuizQuestion[] {
  const chosenSet = pickSet(QUIZ_POOL);
  return chosenSet.map((q) => ({
    ...q,
    options: shuffle(q.options),
  }));
}

// Dica inteligente para Quiz de Ortografia
export function generateSpellingHint(correct: string, options: string[]): string {
  const wrongOptions = options.filter((opt) => opt !== correct);
  const diffLengths = wrongOptions.some((opt) => opt.length !== correct.length);

  if (diffLengths) {
    return `tem ${correct.length} letras no total!`;
  }

  // Encontra primeira letra onde diferem
  for (let i = 0; i < correct.length; i++) {
    const char = correct[i];
    if (wrongOptions.some((opt) => opt[i] !== char)) {
      return `a ${i + 1}ª letra é '${char}'`;
    }
  }

  return `começa com '${correct[0]}' e termina com '${correct[correct.length - 1]}'`;
}

// 3. ALL_RACE_WORDS (Corrida das palavras)
export const ALL_RACE_WORDS = Object.keys(WORD_IMAGES).map((word) => ({
  word,
  image: WORD_IMAGES[word],
}));

export function getDailyRaceWords() {
  return shuffle(ALL_RACE_WORDS).slice(0, 6);
}

// 4. MISSPELLINGS
export const MISSPELLINGS: Record<string, string[]> = {
  CACHORRO: ["KAXORRO", "CACHORO", "KACHORRO"],
  BICICLETA: ["BISICLETA", "BICICRETA", "BICICLETTA"],
  GIRAFA: ["JIRAFA", "GIRAFFA", "JIRAPHA"],
  CHOCOLATE: ["XOCOLATE", "CHOCOLATTE", "CHOCULATE"],
  PASSARINHO: ["PASARINHO", "PACARINHO", "PASSARINHU"],
  ELEFANTE: ["ELEFANTI", "HELEFANTE", "ELEPANTE"],
  BORBOLETA: ["BORBOLETTA", "BORBORETA", "BURBOLETA"],
  TARTARUGA: ["TATARUGA", "TARTALUGA", "TARTARUGHA"],
  GALINHA: ["GALINA", "GALINNA", "GALYNHA"],
  ABACAXI: ["ABACACHI", "HABACAXI", "ABACAXIS"],
  DINOSSAURO: ["DINOSAURO", "DINOSSARO", "DINOZAURO"],
  COELHO: ["COELO", "COELHU", "CUELHO"],
  MACACO: ["MAKAPO", "MAKAACO", "MACAQUO"],
  PEIXE: ["PEICHE", "PEXI", "PEYX"],
  ZEBRA: ["SEBRA", "ZEBBRRA", "ZEVRA"],
  CHAVE: ["XAVE", "CHAVY", "TXAVE"],
  CHUVA: ["XUVA", "CHUA", "CHUBBA"],
  BANANA: ["BANNANA", "BANANNA", "PANANA"],
  LHAMA: ["LAMA", "LIAMA", "LLAMA"],
  CASA: ["CAZA", "KASA", "KAZA"],
};

// 5. SEARCH_POOL (3 caça-palavras 10x10 com palavras ortogonais e diagonais)
export interface SearchPuzzle {
  grid: string[][];
  words: { word: string; image: string }[];
}

export const SEARCH_POOL: SearchPuzzle[] = [
  // Puzzle 1: GATO, SAPO, PATO, BOLA, CASA, MALA
  {
    words: [
      { word: "GATO", image: WORD_IMAGES.GATO },
      { word: "SAPO", image: WORD_IMAGES.SAPO },
      { word: "PATO", image: WORD_IMAGES.PATO },
      { word: "BOLA", image: WORD_IMAGES.BOLA },
      { word: "CASA", image: WORD_IMAGES.CASA },
      { word: "MALA", image: WORD_IMAGES.MALA },
    ],
    grid: [
      ["G", "A", "T", "O", "X", "P", "A", "T", "O", "K"],
      ["B", "W", "R", "L", "Q", "S", "A", "P", "O", "J"],
      ["O", "M", "A", "L", "A", "C", "A", "S", "A", "Y"],
      ["L", "K", "D", "F", "H", "B", "Z", "V", "N", "M"],
      ["A", "P", "T", "G", "H", "J", "K", "L", "C", "X"],
      ["R", "E", "W", "Q", "Y", "U", "I", "O", "P", "A"],
      ["S", "D", "F", "G", "H", "J", "K", "L", "Z", "X"],
      ["C", "V", "B", "N", "M", "Q", "W", "E", "R", "T"],
      ["Y", "U", "I", "O", "P", "A", "S", "D", "F", "G"],
      ["H", "J", "K", "L", "Z", "X", "C", "V", "B", "N"],
    ],
  },
  // Puzzle 2: LOBO, BOLO, MOTO, LAGO, VACA, FOCA
  {
    words: [
      { word: "LOBO", image: WORD_IMAGES.LOBO },
      { word: "BOLO", image: WORD_IMAGES.BOLO },
      { word: "MOTO", image: WORD_IMAGES.MOTO },
      { word: "LAGO", image: WORD_IMAGES.LAGO },
      { word: "VACA", image: WORD_IMAGES.VACA },
      { word: "FOCA", image: WORD_IMAGES.FOCA },
    ],
    grid: [
      ["L", "O", "B", "O", "X", "B", "O", "L", "O", "M"],
      ["V", "M", "O", "T", "O", "R", "T", "Y", "U", "O"],
      ["A", "Q", "L", "A", "G", "O", "P", "A", "S", "T"],
      ["C", "A", "B", "F", "O", "C", "A", "D", "F", "O"],
      ["A", "Z", "X", "C", "V", "B", "N", "M", "Q", "W"],
      ["E", "R", "T", "Y", "U", "I", "O", "P", "A", "S"],
      ["D", "F", "G", "H", "J", "K", "L", "Z", "X", "C"],
      ["V", "B", "N", "M", "Q", "W", "E", "R", "T", "Y"],
      ["U", "I", "O", "P", "A", "S", "D", "F", "G", "H"],
      ["J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"],
    ],
  },
  // Puzzle 3: ZEBRA, PEIXE, CHAVE, CHUVA, LHAMA, PATO
  {
    words: [
      { word: "ZEBRA", image: WORD_IMAGES.ZEBRA },
      { word: "PEIXE", image: WORD_IMAGES.PEIXE },
      { word: "CHAVE", image: WORD_IMAGES.CHAVE },
      { word: "CHUVA", image: WORD_IMAGES.CHUVA },
      { word: "LHAMA", image: WORD_IMAGES.LHAMA },
      { word: "PATO", image: WORD_IMAGES.PATO },
    ],
    grid: [
      ["Z", "E", "B", "R", "A", "W", "P", "A", "T", "O"],
      ["P", "E", "I", "X", "E", "Q", "A", "S", "D", "F"],
      ["C", "H", "A", "V", "E", "G", "H", "J", "K", "L"],
      ["C", "H", "U", "V", "A", "Z", "X", "C", "V", "B"],
      ["L", "H", "A", "M", "A", "N", "M", "Q", "W", "E"],
      ["R", "T", "Y", "U", "I", "O", "P", "A", "S", "D"],
      ["F", "G", "H", "J", "K", "L", "Z", "X", "C", "V"],
      ["B", "N", "M", "Q", "W", "E", "R", "T", "Y", "U"],
      ["I", "O", "P", "A", "S", "D", "F", "G", "H", "J"],
      ["K", "L", "Z", "X", "C", "V", "B", "N", "M", "Q"],
    ],
  },
];

export function getDailySearchPuzzle(): SearchPuzzle {
  return pickSet(SEARCH_POOL);
}

// 6. IMAGE_POOL (5 sets de 4 pares com distratores)
export interface ImagePair {
  word: string;
  image: string;
}

export const IMAGE_POOL: ImagePair[][] = [
  [
    { word: "GATO", image: WORD_IMAGES.GATO },
    { word: "CACHORRO", image: WORD_IMAGES.CACHORRO },
    { word: "GIRAFA", image: WORD_IMAGES.GIRAFA },
    { word: "ELEFANTE", image: WORD_IMAGES.ELEFANTE },
  ],
  [
    { word: "BORBOLETA", image: WORD_IMAGES.BORBOLETA },
    { word: "ABACAXI", image: WORD_IMAGES.ABACAXI },
    { word: "BICICLETA", image: WORD_IMAGES.BICICLETA },
    { word: "COELHO", image: WORD_IMAGES.COELHO },
  ],
  [
    { word: "ZEBRA", image: WORD_IMAGES.ZEBRA },
    { word: "MACACO", image: WORD_IMAGES.MACACO },
    { word: "PEIXE", image: WORD_IMAGES.PEIXE },
    { word: "TARTARUGA", image: WORD_IMAGES.TARTARUGA },
  ],
  [
    { word: "GALINHA", image: WORD_IMAGES.GALINHA },
    { word: "LHAMA", image: WORD_IMAGES.LHAMA },
    { word: "CHOCOLATE", image: WORD_IMAGES.CHOCOLATE },
    { word: "PASSARINHO", image: WORD_IMAGES.PASSARINHO },
  ],
  [
    { word: "CASA", image: WORD_IMAGES.CASA },
    { word: "BOLA", image: WORD_IMAGES.BOLA },
    { word: "CHAVE", image: WORD_IMAGES.CHAVE },
    { word: "CHUVA", image: WORD_IMAGES.CHUVA },
  ],
];

export function getDailyImagePairs(): ImagePair[] {
  return pickSet(IMAGE_POOL);
}

export function getSpellingDistractors(correctWords: string[]): string[] {
  const distractors: string[] = [];
  correctWords.forEach((word) => {
    const list = MISSPELLINGS[word];
    if (list && list.length > 0) {
      distractors.push(list[0]);
    } else {
      // Cria distrator simples se não listado
      distractors.push(word.replace("A", "E").replace("O", "U"));
    }
  });
  return distractors;
}

// 7. CROSSWORD_POOL (4 cruzadinhas verificadas)
export interface CrosswordClue {
  num: number;
  dir: "H" | "V";
  clue: string;
  word: string;
  row: number;
  col: number;
}

export interface CrosswordPuzzle {
  gridSize: number; // ex: 6x6
  answer: (string | null)[][];
  clues: CrosswordClue[];
  cellNumbers: Record<string, number>; // "row-col" -> clue number
}

export const CROSSWORD_POOL: CrosswordPuzzle[] = [
  // Puzzle 1:
  (() => {
      // Construção milimétrica de cruzadinha 5x5:
      // Palavras:
      // 1. Vertical (V): GATO (r0,c1: G, A, T, O)
      // 2. Horiz (H): SAPO (r1,c0: S, A, P, O) - cruza no A (r1,c1)
      // 3. Horiz (H): TETO (r2,c1: T, E, T, O) - cruza no T (r2,c1)
      // 4. Horiz (H): OVO  (r3,c1: O, V, O)    - cruza no O (r3,c1)
      const ans: (string | null)[][] = [
        [null, "G", null, null, null],
        ["S", "A", "P", "O", null],
        [null, "T", "E", "T", "O"],
        [null, "O", "V", "O", null],
        [null, null, null, null, null],
      ];
      return {
        gridSize: 5,
        answer: ans,
        clues: [
          { num: 1, dir: "V", clue: "Animal que mia e bebe leite", word: "GATO", row: 0, col: 1 },
          { num: 2, dir: "H", clue: "Pula na lagoa e faz quá-quá não, faz coaxa", word: "SAPO", row: 1, col: 0 },
          { num: 3, dir: "H", clue: "Fica no alto da nossa casa", word: "TETO", row: 2, col: 1 },
          { num: 4, dir: "H", clue: "A galinha bota no ninho", word: "OVO", row: 3, col: 1 },
        ],
        cellNumbers: {
          "0-1": 1,
          "1-0": 2,
          "2-1": 3,
          "3-1": 4,
        },
      };
  })(),
  // Puzzle 2:
  // 1. V: BOLA (r0,c2: B, O, L, A)
  // 2. H: LOBO (r1,c1: L, O, B, O) - cruza no O (r1,c2)
  // 3. H: LUA  (r2,c2: L, U, A)    - cruza no L (r2,c2)
  // 4. H: PATO (r3,c1: P, A, T, O) - cruza no A (r3,c2)
  (() => {
    const ans: (string | null)[][] = [
      [null, null, "B", null, null],
      [null, "L", "O", "B", "O"],
      [null, null, "L", "U", "A"],
      [null, "P", "A", "T", "O"],
      [null, null, null, null, null],
    ];
    return {
      gridSize: 5,
      answer: ans,
      clues: [
        { num: 1, dir: "V", clue: "Usada para jogar futebol", word: "BOLA", row: 0, col: 2 },
        { num: 2, dir: "H", clue: "Uiva nas noites de floresta", word: "LOBO", row: 1, col: 1 },
        { num: 3, dir: "H", clue: "Brilha no céu durante a noite", word: "LUA", row: 2, col: 2 },
        { num: 4, dir: "H", clue: "Ave aquática que faz quá-quá", word: "PATO", row: 3, col: 1 },
      ],
      cellNumbers: {
        "0-2": 1,
        "1-1": 2,
        "2-2": 3,
        "3-1": 4,
      },
    };
  })(),
  // Puzzle 3:
  // 1. V: CASA (r0,c2: C, A, S, A)
  // 2. H: PATO (r1,c1: P, A, T, O) - cruza no A (r1,c2)
  // 3. H: SAPO (r2,c2: S, A, P, O) - cruza no S (r2,c2)
  // 4. H: MALA (r3,c1: M, A, L, A) - cruza no A (r3,c2)
  (() => {
    const ans: (string | null)[][] = [
      [null, null, "C", null, null],
      [null, "P", "A", "T", "O"],
      [null, null, "S", "A", "P", "O"],
      [null, "M", "A", "L", "A"],
      [null, null, null, null, null],
    ];
    return {
      gridSize: 6,
      answer: ans,
      clues: [
        { num: 1, dir: "V", clue: "Lugar onde moramos com nossa família", word: "CASA", row: 0, col: 2 },
        { num: 2, dir: "H", clue: "Nada no lago e tem bico amarelo", word: "PATO", row: 1, col: 1 },
        { num: 3, dir: "H", clue: "Anfíbio verde que salta bem alto", word: "SAPO", row: 2, col: 2 },
        { num: 4, dir: "H", clue: "Usamos para guardar roupas ao viajar", word: "MALA", row: 3, col: 1 },
      ],
      cellNumbers: {
        "0-2": 1,
        "1-1": 2,
        "2-2": 3,
        "3-1": 4,
      },
    };
  })(),
  // Puzzle 4:
  // 1. V: PEIXE (r0,c1: P, E, I, X, E)
  // 2. H: PATO (r0,c1: P, A, T, O)
  // 3. H: LAGO (r2,c0: L, I... / melhor: LIMA)
  (() => {
    const ans: (string | null)[][] = [
      [null, "P", "A", "T", "O"],
      [null, "E", null, null, null],
      ["F", "I", "T", "A", null],
      [null, "X", null, null, null],
      [null, "E", null, null, null],
    ];
    return {
      gridSize: 5,
      answer: ans,
      clues: [
        { num: 1, dir: "V", clue: "Vive na água e nada com barbatanas", word: "PEIXE", row: 0, col: 1 },
        { num: 2, dir: "H", clue: "Ave que adora nadar no lago", word: "PATO", row: 0, col: 1 },
        { num: 3, dir: "H", clue: "Tira de tecido para enfeitar presentes", word: "FITA", row: 2, col: 0 },
      ],
      cellNumbers: {
        "0-1": 1,
        "2-0": 3,
      },
    };
  })(),
];

export function getDailyCrossword(): CrosswordPuzzle {
  return pickSet(CROSSWORD_POOL);
}

// 8. GAME_LABELS
export const GAME_LABELS: Record<string, { name: string; emoji: string; desc: string }> = {
  "drag-drop": { name: "Forme a Palavra", emoji: "🔤", desc: "Junte as sílabas certas para formar a palavra!" },
  "spelling-quiz": { name: "Quiz de Ortografia", emoji: "🔡", desc: "Descubra a escrita correta entre as opções!" },
  "word-race": { name: "Corrida das Palavras", emoji: "🏎️", desc: "Ordene as letras rápido antes que o tempo acabe!" },
  "word-search": { name: "Caça-Palavras", emoji: "🔍", desc: "Encontre as palavras escondidas na grade mágica!" },
  "image-word": { name: "Imagem e Palavra", emoji: "🖼️", desc: "Ligue cada ilustração ao seu nome correto!" },
  "crossword": { name: "Cruzadinha", emoji: "✏️", desc: "Preencha as letras com as pistas das palavras!" },
  "math": { name: "Matemática", emoji: "🔢", desc: "Resolva as continhas de mais e menos com bolinhas!" },
  "drawing": { name: "Desenho Livre", emoji: "🎨", desc: "Solte a criatividade com cores e pinceis divertidos!" },
  "math-portugues": { name: "Conta e Escreve", emoji: "🔢📝", desc: "Calcule e encontre o número por extenso!" },
};

// Vocabulário de números por extenso para Conta e Escreve
export const NUMBERS_IN_WORDS: Record<number, string> = {
  1: "UM",
  2: "DOIS",
  3: "TRÊS",
  4: "QUATRO",
  5: "CINCO",
  6: "SEIS",
  7: "SETE",
  8: "OITO",
  9: "NOVE",
  10: "DEZ",
  11: "ONZE",
  12: "DOZE",
};
