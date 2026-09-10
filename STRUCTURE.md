# Letter Play - Architecture & Structure

## Stack
- React 19 + TypeScript + Vite + Tailwind CSS v4
- Fontes: Fredoka One + Nunito (Google Fonts)
- Persistência: LocalStorage (Store modular)
- Áudio: Web Speech API (pt-BR)

## Estrutura de Arquivos

```
client/
  index.html                      # Imports das fontes Fredoka One e Nunito
  src/
    types.ts                      # Tipos de dados (Teacher, Student, Turma, GameSession, Screen)
    store.ts                      # LocalStorage manager, seed v4, cálculo de pontuações, XP e estatísticas
    audio.ts                      # Sintetizador de voz pt-BR para palavras e matemática
    dailyWords.ts                 # Banco léxico, imagens curadas, distratores e cruzadinhas
    imports/
      wallpaper.png               # Ilustração de fundo de alta qualidade
      mascot.png                  # Mascote do jogo
    components/
      GameShared.tsx              # GameHeader, GameResult, Hearts, HintBox
      MascotBadge.tsx             # Elemento lúdico animado
    pages/
      HomeScreen.tsx              # Portal inicial
      TeacherLogin.tsx            # Login professor
      TeacherRegister.tsx         # Cadastro professor
      TeacherDashboard.tsx        # Painel: Turmas, Alunos, Desempenho, Histórico
      StudentLogin.tsx            # Login aluno
      StudentHub.tsx              # Central de jogos do aluno
      games/
        DragDropGame.tsx          # 1. Forme a Palavra
        SpellingQuizGame.tsx      # 2. Quiz de Ortografia
        WordRaceGame.tsx          # 3. Corrida das Palavras
        WordSearchGame.tsx        # 4. Caça-Palavras
        ImageWordGame.tsx         # 5. Imagem e Palavra
        CrosswordGame.tsx         # 6. Cruzadinha
        MathGame.tsx              # 7. Matemática
        DrawingGame.tsx           # 8. Desenho Livre
        MathPortuguesGame.tsx     # 9. Conta e Escreve
    App.tsx                       # Gerenciador global de navegação e estado atual
    index.css                     # Tailwind v4, custom utility classes e variáveis estéticas
```
