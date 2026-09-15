# Conteúdo pedagógico

O arquivo principal é `wordBank.ts`. Ele concentra os dados que podem ser editados sem mexer na lógica visual dos jogos.

## Seções de `wordBank.ts`

1. `WORD_IMAGES`: mapa entre palavra e imagem.
2. `ALL_DRAG_WORDS`: palavras e sílabas do Forme a Palavra.
3. `QUIZ_POOL`: perguntas e alternativas do Quiz de Ortografia.
4. `ALL_RACE_WORDS`: palavras usadas na Corrida das Palavras.
5. `MISSPELLINGS`: erros plausíveis usados como distratores.
6. `SEARCH_POOL`: grades e palavras do Caça-Palavras.
7. `IMAGE_POOL`: pares do jogo Imagem e Palavra.
8. `CROSSWORD_POOL`: cruzadinhas, respostas e pistas.
9. `GAME_LABELS`: nome, emoji e descrição exibidos nos menus.
10. `NUMBERS_IN_WORDS`: números por extenso do jogo Conta e Escreve.

Quando a mudança for apenas de conteúdo, edite este arquivo. Quando for uma mudança de regra ou interface, edite o componente correspondente em `../pages/games/`.
