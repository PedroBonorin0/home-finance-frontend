# 💰 Finanças — Frontend

React + Redux + TypeScript para controle de finanças pessoais.

## Configuração

```bash
cp .env.example .env
# Edite VITE_API_URL apontando para o backend NestJS
```

## Rodar

```bash
npm install
npm run dev
# Abre em http://localhost:5173
```

## Páginas

| Rota | Página |
|------|--------|
| `/` | Visão geral do mês com filtros e resumo financeiro |
| `/registros` | CRUD completo de registros |
| `/categorias` | CRUD completo de categorias |

## Stack

- **React 18** + **TypeScript**
- **Redux Toolkit** — estado global (categories + records)
- **React Router v6** — navegação
- **Axios** — chamadas HTTP
- **date-fns** — manipulação de datas
- **Lucide React** — ícones
- **Vite** — bundler
