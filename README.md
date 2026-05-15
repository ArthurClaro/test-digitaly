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

O frontend tem uma suite E2E que cobre proteção de rotas, fluxo de OAuth (até o redirect para o GitHub), interações do jogo (revelar, bandeira, derrota, vitória) e persistência do score.

```bash
cd frontend
pnpm exec playwright install chromium      # primeira vez
NEXT_PUBLIC_E2E=true pnpm build
NEXT_PUBLIC_E2E=true NEXTAUTH_URL=http://localhost:3000 AUTH_TRUST_HOST=true pnpm start &
pnpm exec playwright test
```

A suite usa uma sessão NextAuth sintética (assinada com o `NEXTAUTH_SECRET` local) para pular o fluxo OAuth do GitHub e exercitar o app autenticado de ponta a ponta.

## Licença

MIT — veja [LICENSE](./LICENSE).
