# Test Digitaly — Campo Minado FullStack

Desafio técnico fullstack: jogo de **Campo Minado** com autenticação via GitHub, ranking global e arquitetura limpa.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + shadcn/ui + Tailwind
- **Backend**: NestJS 10 + TypeORM + class-validator
- **Banco**: PostgreSQL 16
- **Auth**: NextAuth v5 com provider GitHub (JWT compartilhado com o backend)

## Estrutura

```
test-digitaly/
├── backend/         # NestJS API
├── frontend/        # Next.js App
├── docker-compose.yml
└── README.md
```

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose
- Uma OAuth App do GitHub ([criar aqui](https://github.com/settings/developers))
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Como rodar

### 1. Subir Postgres

```bash
docker compose up -d
```

Postgres ficará em `localhost:5433`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# editar .env preenchendo NEXTAUTH_SECRET (igual ao do frontend)
pnpm install
pnpm migration:run
pnpm start:dev
```

API em `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# editar .env.local com:
#   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET
pnpm install
pnpm dev
```

App em `http://localhost:3000`.

## Páginas

| Rota       | Descrição                       | Protegida |
|------------|---------------------------------|-----------|
| `/login`   | Login com GitHub                | não       |
| `/`        | Jogo (Campo Minado)             | sim       |
| `/ranking` | Top 30 pontuações globais       | sim       |

## API

| Método | Rota                  | Auth  | Descrição                                        |
|--------|-----------------------|-------|--------------------------------------------------|
| POST   | `/scores`             | sim   | Salva score do jogador autenticado               |
| GET    | `/scores/ranking`     | não   | Retorna top 30 (filtro opcional `?boardSize=`)   |

Rotas protegidas exigem header `Authorization: Bearer <jwt>` HS256 emitido pelo NextAuth (callback `jwt` em `frontend/src/lib/auth.ts`) e validado no backend via `AuthGuard` usando o mesmo `NEXTAUTH_SECRET` compartilhado.

## Tamanhos de campo

| Tamanho | Minas |
|---------|-------|
| 9x9     | 10    |
| 16x16   | 40    |
| 30x16   | 99    |

## Como testar manualmente

1. Acesse `http://localhost:3000` → será redirecionado para `/login`
2. Faça login com GitHub
3. Escolha o tamanho do campo e jogue
4. Em caso de vitória, o score é salvo automaticamente
5. Acesse `/ranking` para ver o top 30

## Testes automatizados (Playwright)

O frontend tem uma suite E2E (12 testes) que cobre:

- Proteção de rotas via middleware (`/` e `/ranking` redirecionam para `/login` sem sessão)
- Fluxo de OAuth até o redirect para o GitHub
- Interações do jogo: clique esquerdo revela, clique direito coloca bandeira, primeira jogada nunca em mina, flood fill, derrota ao clicar em mina, **vitória → POST /scores → score persistido no ranking**

```bash
# 1. Backend e Postgres precisam estar rodando (ver "Como rodar")

# 2. Build do frontend com hook de E2E e start em background
cd frontend
pnpm exec playwright install chromium      # primeira vez
NEXT_PUBLIC_E2E=true pnpm build
NEXT_PUBLIC_E2E=true AUTH_TRUST_HOST=true pnpm start &

# 3. Rodar os testes
pnpm exec playwright test
```

A suite usa uma sessão NextAuth sintética (JWE encodado com o mesmo `NEXTAUTH_SECRET` local) para pular o fluxo OAuth do GitHub e exercitar o app autenticado de ponta a ponta — não depende de credenciais reais nem da rede do GitHub. A flag `NEXT_PUBLIC_E2E=true` expõe `window.__game` somente em build de teste, sem vazar em produção.

## Decisões de arquitetura

- **JWT compartilhado**: o NextAuth (frontend) assina um JWT HS256 com `NEXTAUTH_SECRET` no callback `jwt` e o expõe na sessão como `backendJwt`. O backend valida o mesmo token com o mesmo secret no `AuthGuard`. Evita round-trip ao GitHub a cada request e mantém o backend stateless.
- **Middleware de proteção via cookie direto**: o middleware do Next checa a presença do cookie de sessão sem usar o wrapper do NextAuth — evita problemas conhecidos do `UntrustedHost` no v5 beta e simplifica o edge runtime.
- **Repository Pattern**: o módulo `scores` separa controller / service / repository. O `ScoresRepository` encapsula o `Repository<Score>` do TypeORM, permitindo trocar a fonte de dados sem mexer no service.
- **DTO validation com `class-validator`**: `CreateScoreDto` impõe enum em `boardSize` e bounds em `timeMs` (mínimo 1s, máximo 1h) — evita scores fraudulentos.
- **Flood fill BFS com ponteiro**: a revelação em cascata usa índice de ponteiro em vez de `Array.shift()` (O(n)) — escala em boards 30x16 sem regressão de performance.
- **Primeira jogada nunca em mina**: o tabuleiro só é gerado **depois** do primeiro clique, garantindo célula inicial segura (comportamento clássico do Campo Minado).

## Licença

MIT — veja [LICENSE](./LICENSE).
