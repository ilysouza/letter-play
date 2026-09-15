# Jogos

Cada arquivo desta pasta é um jogo independente. O nome do arquivo corresponde ao nome técnico do jogo e a descrição amigável fica em `client/src/content/wordBank.ts`, dentro de `GAME_LABELS`.

Para editar regras, estados, pontuação ou layout, abra o arquivo do jogo. Para editar palavras, imagens, sílabas ou alternativas, prefira `client/src/content/wordBank.ts`.

Todo jogo deve receber `student` e `onBack`, registrar pontuação com `updateStudentScore` e usar `GameHeader`/`GameResult` quando fizer sentido para manter a navegação consistente.
