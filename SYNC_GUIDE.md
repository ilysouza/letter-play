# Sincronização local e online — Letter Play

## Uso recomendado na escola (sem internet)

O servidor deve ser instalado em **um computador fixo da escola**, que ficará ligado durante o uso. Quando `DATABASE_URL` não estiver definida, o sistema usa automaticamente um arquivo local em `data/letter-play.json`. Esse arquivo é o banco compartilhado: todos os computadores devem abrir a aplicação pelo endereço do servidor, e não por `localhost`.

No computador servidor, execute:

```bash
npm install
npm run dev
```

O servidor escuta em todas as interfaces de rede (`0.0.0.0`). Descubra o IPv4 do computador servidor no Windows com `ipconfig` e, nos outros computadores, abra `http://IP_DO_SERVIDOR:3000` (por exemplo, `http://192.168.1.25:3000`). Se a porta 3000 estiver ocupada, o terminal informará a porta escolhida. Nesse caso, use essa porta no endereço.

No Firewall do Windows, permita o Node.js na rede **Privada** ou crie uma regra de entrada TCP para a porta utilizada. Todos os computadores precisam estar na mesma rede local. O computador servidor precisa permanecer ligado; se ele desligar, a aplicação não poderá ser acessada.

Faça cópia de segurança periódica de `data/letter-play.json`. Não coloque esse arquivo no GitHub: ele contém dados da escola e está protegido pelo `.gitignore`.

Para usar um MySQL local em vez do arquivo JSON, defina `DATABASE_URL` no ambiente do servidor. Nesse caso, o sistema continua usando o router MySQL existente.

## O que foi corrigido

Turmas, alunos, preferências de áudio, pontuações e histórico agora são armazenados no banco online do projeto. Por isso, o professor pode criar uma turma em um computador e encontrá-la ao entrar na mesma conta em outro computador.

As senhas não são armazenadas em texto puro: o servidor usa `scrypt` com salt para gerar e validar os hashes.

## Fluxo de uso

1. O professor entra em **Área do professor** com o mesmo email e senha usados no cadastro.
2. O painel carrega as turmas, alunos e histórico diretamente do banco.
3. Ao criar, editar, excluir ou alterar o áudio de um aluno, a operação é enviada ao servidor.
4. O aluno entra com o email e senha cadastrados pelo professor.
5. Ao terminar uma atividade, a pontuação é salva no banco e aparece para o professor e para o aluno em outros dispositivos.

## Migração automática

Contas e dados criados na versão antiga, que ficavam apenas no `localStorage`, são migrados automaticamente quando o professor faz o primeiro login após esta atualização. A migração é idempotente: repetir o login não duplica turmas, alunos ou sessões.

Se o login estiver sendo feito em um navegador sem os dados antigos, use o email e senha da conta que já foi migrada em outro computador. Não crie uma segunda conta com o mesmo email.

## Arquivos técnicos

| Responsabilidade | Arquivo |
|---|---|
| Tabelas do banco | `drizzle/schema.ts` |
| Migração SQL | `drizzle/0000_misty_alex_power.sql` |
| APIs de conta, turma, aluno e pontuação | `server/letterPlayRouter.ts` |
| Router tRPC principal | `server/routers.ts` |
| Cliente online do frontend | `client/src/cloud.ts` |
| Compatibilidade e cache local | `client/src/store.ts` |
| Logins | `client/src/pages/TeacherLogin.tsx` e `StudentLogin.tsx` |
| Operações do professor | `client/src/pages/TeacherDashboard.tsx` |

## Desenvolvimento local

Dentro da pasta do projeto:

```bash
pnpm install
pnpm check
pnpm test
pnpm run build
```

O banco configurado pelo WebDev já recebeu a migração. Se o schema for alterado no futuro, gere uma nova migração com `pnpm drizzle-kit generate`, revise o SQL gerado e aplique-o pelo fluxo de migração do WebDev.

## Observação sobre conexão

O painel mostra um aviso quando o banco não está acessível e usa o cache local apenas como fallback temporário. Para sincronizar de fato, o servidor publicado precisa estar ativo e todos os dispositivos precisam usar a mesma URL do projeto.
