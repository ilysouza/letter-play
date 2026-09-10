# Game Plan: Letter Play

## Visão Geral
Letter Play (AlfaJogo) é uma plataforma educacional lúdica de avaliação e prática da alfabetização para crianças do ensino fundamental, com área do Aluno (9 jogos educativos) e área do Professor (gestão de turmas, alunos, desempenho e histórico).

## Riscos Isolados
1. **Caça-Palavras com Seleção Interativa por Arraste e Toque (Line Selection)**
   - *Risco:* Cálculo incorreto de ângulos ortogonais e diagonais a 45 graus, falhas no toque mobile e cancelamento de seleção.
   - *Solução:* Função matemática pura determinística `getLineCells(start, end)` que valida horizontal, vertical e diagonal simétrica; tratamento de pointer events com captura unificada.
   - *Verificação:* Palavras selecionáveis em qualquer sentido (normal ou invertido), sem travamento no mobile e destacadas com cores distintas.

2. **Cruzadinha com Auto-foco e Navegação Bidirecional**
   - *Risco:* Foco preso em células nulas/bloqueadas, falha no backspace e inconsistência no preenchimento sequencial.
   - *Solução:* Matriz indexada com refs ordenadas (`Map<string, HTMLInputElement>`), pulando células pretas automaticamente e gerenciando backspace suavemente.
   - *Verificação:* Digitação fluida direta nos slots das palavras, transição correta entre letras e verificação colorida.

3. **Áudio Web Speech API sem Quebras de Assincronia**
   - *Risco:* Utterances acumuladas falando palavras anteriores, vozes cortadas ou bloqueadas sem interação.
   - *Solução:* Wrapper com cancelamento prévio `speechSynthesis.cancel()`, fallback limpo se não suportado, respeitando toggle `student.audioEnabled`.

4. **Desenho Livre com Escala Responsiva e Preservação de Traço**
   - *Risco:* Coordenadas desalinhadas em telas de densidades diferentes (Retina/DPI) e eventos de toque arrastando a página.
   - *Solução:* Resolução lógica fixa com matriz de transformação via `getBoundingClientRect()` e `touch-action: none`.

## Main Build
- **Estrutura de Estado e Persistência:** `types.ts`, `store.ts` (com seed de demonstração idêntica à especificação).
- **Banco de Palavras e Conteúdo Diário:** `dailyWords.ts` com imagens temáticas de alta qualidade, distratores ortográficos plausíveis e pools diários.
- **Identidade Visual Premium Infantil:**
  - Fontes: Fredoka One para títulos, Nunito para corpo.
  - Cores: Fundo creme aconchegante (`#FFFBF0`), tons vibrantes e amigáveis (coral `#FF6B6B`, menta/teal `#4ECDC4`, lavanda `#6C5CE7`, dourado `#F59E0B`).
  - Texturas e Ilustrações temáticas geradas por IA (backgrounds do portal, mascotes, cards ilustrados).
  - Componentes refinados: cartões com relevo tátil, bordas arredondadas e feedback sonoro/visual.
- **Telas Principais:**
  - `HomeScreen` (Hero lúdico, seleção Professor vs Aluno, mascotes, acesso rápido)
  - `TeacherLogin` / `TeacherRegister` / `TeacherDashboard` (Turmas, Alunos, Desempenho comparativo com gráficos e Ranking, Histórico dos 14 dias com bolinhas)
  - `StudentLogin` / `StudentHub` (Perfil do aluno, XP, Nível Alfabético, barra de progresso, grid dos 9 jogos)
- **Os 9 Jogos Completos:**
  1. Forme a Palavra (Sílabas)
  2. Quiz de Ortografia (Distratores fonéticos)
  3. Corrida das Palavras (Anagrama cronometrado com pista de corrida)
  4. Caça-Palavras (Grid 10x10 com seleção por arraste)
  5. Imagem e Palavra (Conexões visuais)
  6. Cruzadinha (Palavras cruzadas interativas 80x80)
  7. Matemática (Contas com bolinhas interativas de ajuda)
  8. Desenho Livre (Paleta rica, espessuras, borracha, limpar e salvar)
  9. Conta e Escreve (Resultado por extenso em português com representação visual)

## Verificação
- Compilação limpa sem erros de TypeScript (`pnpm check` ou `tsc --noEmit`).
- Teste visual de cada tela e jogo usando `webdev_take_screenshot`.
- Persistência e regras de XP funcionando no localStorage.
