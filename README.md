# Bancada

**Bancada** é uma vitrine gamificada de side projects: um placar semanal com
pódio, votos e XP para a comunidade de builders. A interface segue uma metáfora
física de "bancada de trabalho" — madeira texturizada, papel, carimbos
editoriais e botões que afundam ao clicar.

Projeto criado com [Next.js](https://nextjs.org) (App Router, TypeScript,
Tailwind CSS v4), iniciado via `create-next-app`.

## Telas

| Rota | Tela | Descrição |
| --- | --- | --- |
| `/` | **Placar (1b)** | Tela principal: pódio (top 3), lista ranqueada, XP do usuário e ação de publicar. |
| `/project/[slug]` | **Detalhe (1d)** | Hero, estatísticas, ações físicas (votar/abrir), descrição, tags e reviews da comunidade. |
| `/dev/[handle]` | **Perfil (1e)** | Nível, barra de XP, conquistas e projetos publicados do dev. |

A tela principal é a **1b** (placar de ranking); as telas internas seguem a
direção visual da 1b, conforme o protótipo de referência.

## Rodando localmente

```bash
npm install
npm run dev
# abra http://localhost:3000
```

Outros comandos:

```bash
npm run build   # build de produção
npm run start   # serve o build de produção
npm run lint    # ESLint
```

## Estrutura

```
src/
  app/
    page.tsx                 # 1b — placar (tela principal)
    project/[slug]/page.tsx  # 1d — detalhe do projeto
    dev/[handle]/page.tsx    # 1e — perfil do dev
    layout.tsx               # fontes (Archivo, JetBrains Mono, Newsreader) + metadata
    globals.css              # tokens e estilos base
  components/                # Board, Logo, PodiumCard, RankRow, VoteButton, etc.
  lib/data.ts                # dados de projetos, reviews e devs
```

O voto é interativo: cada botão físico incrementa a contagem localmente ao
clicar.
