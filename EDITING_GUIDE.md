# Guia rápido de edição — Letter Play

Este arquivo é o mapa do projeto. Para alterar algo, comece pela seção correspondente abaixo.

## Onde editar cada coisa

| Quero alterar... | Arquivo/pasta | O que procurar |
|---|---|---|
| Uma palavra, sílabas ou imagem | `client/src/content/wordBank.ts` | `WORD_IMAGES`, `ALL_DRAG_WORDS`, `QUIZ_POOL`, `IMAGE_POOL` |
| Uma imagem local | `client/src/assets/words/` | Use o mesmo nome da palavra, em minúsculas |
| Nome, emoji ou descrição de um jogo | `client/src/content/wordBank.ts` | `GAME_LABELS` |
| Regras ou layout de um jogo | `client/src/pages/games/` | Arquivo com o nome do jogo, por exemplo `DragDropGame.tsx` |
| Página inicial | `client/src/pages/HomeScreen.tsx` | Textos, botões e apresentação inicial |
| Área do aluno | `client/src/pages/StudentHub.tsx` | Lista de jogos e progresso |
| Área do professor | `client/src/pages/TeacherDashboard.tsx` | Turmas, alunos, áudio e desempenho |
| Login do aluno | `client/src/pages/StudentLogin.tsx` | Formulário e textos do aluno |
| Login do professor | `client/src/pages/TeacherLogin.tsx` | Formulário e textos do professor |
| Cadastro de professor | `client/src/pages/TeacherRegister.tsx` | Campos e validações de cadastro |
| Cores e tipografia globais | `client/src/index.css` | Tokens, fontes e estilos gerais |
| Cabeçalho, dicas e resultado dos jogos | `client/src/components/GameShared.tsx` | Componentes compartilhados |
| Pontuação e persistência | `client/src/store.ts` | `updateStudentScore`, alunos e histórico |
| Voz/áudio | `client/src/audio.ts` | Função `speak` |
| Rotas e abertura de telas | `client/src/App.tsx` | `Screen`, imports e condições de tela |

## Como adicionar uma palavra com imagem

1. Coloque a imagem otimizada em `client/src/assets/words/`, usando um nome simples, por exemplo `mochila.jpg`.
2. Importe a imagem no topo de `client/src/content/wordBank.ts`:

```ts
import mochilaImg from "@/assets/words/mochila.jpg";
```

3. Cadastre a imagem em `WORD_IMAGES`:

```ts
MOCHILA: mochilaImg,
```

4. Se a palavra entrar no jogo de sílabas, adicione também em `ALL_DRAG_WORDS`:

```ts
{ word: "MOCHILA", syllables: ["MO", "CHI", "LA"], image: WORD_IMAGES.MOCHILA },
```

5. Se entrar no quiz, crie quatro opções em `QUIZ_POOL`. A resposta correta deve ser exatamente igual ao campo `word`.

## Como editar um jogo

Cada jogo tem um arquivo próprio em `client/src/pages/games/`:

- `DragDropGame.tsx` — Forme a Palavra
- `SpellingQuizGame.tsx` — Quiz de Ortografia
- `WordRaceGame.tsx` — Corrida das Palavras
- `WordSearchGame.tsx` — Caça-Palavras
- `ImageWordGame.tsx` — Imagem e Palavra
- `CrosswordGame.tsx` — Cruzadinha
- `MathGame.tsx` — Matemática
- `MathPortuguesGame.tsx` — Conta e Escreve
- `DrawingGame.tsx` — Desenho Livre
- `LetterHuntGame.tsx` — Caça à Letra

Para mudar apenas palavras e imagens, prefira editar `content/wordBank.ts`. Só edite o arquivo do jogo quando quiser mudar regras, botões, layout ou comportamento.

## Como testar depois de editar

No terminal, dentro de `/home/ubuntu/letter-play`:

```bash
pnpm check
pnpm run build
```

Para conferir a tela no navegador, use o preview do projeto. As dimensões importantes são:

- Celular: `375x812`
- Tablet: `768x1024`
- Desktop: `1440x900`

## Regras para evitar erros

- Use palavras em **CAIXA ALTA** no conteúdo pedagógico.
- A palavra em `word` deve ser igual à resposta correta nas opções.
- A quantidade de sílabas precisa ser igual à quantidade de blocos esperada pelo jogo.
- A imagem precisa representar diretamente a palavra.
- Prefira imagens locais em `assets/words/` para conteúdos pedagógicos importantes.
- Não apague um jogo do arquivo sem remover também sua entrada em `GAME_LABELS`, `StudentHub.tsx` e `App.tsx`.
- Depois de alterar conteúdo, sempre rode `pnpm check` e `pnpm run build`.
