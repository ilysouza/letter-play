# Sincronização online — Letter Play

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
