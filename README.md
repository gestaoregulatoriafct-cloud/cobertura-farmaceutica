# Cobertura Farmacêutica (MVP)

Site para importar uma planilha de escalas e gerar ranking de filiais com minutos sem cobertura + sugestões para RH.

## Rodar local
1. Copie `.env.example` para `.env` e mantenha `DATABASE_URL="file:./dev.db"`
2. Instale deps: `npm i`
3. Migre banco: `npx prisma migrate dev --name init`
4. Rode: `npm run dev` e abra `http://localhost:3000`

## Deploy (gera o link)
Opção mais simples: Vercel
- Crie conta Vercel
- Suba este projeto no GitHub
- Conecte na Vercel e clique Deploy
- A Vercel te entrega o link (ex.: https://cobertura-farmaceutica.vercel.app)

> Nota: SQLite em Vercel exige configuração (filesystem). Para produção, migre para Postgres (Neon/Supabase).

## Próximas melhorias
- Usar horário real da loja por filial (incluindo 24h)
- Gerar gaps exatos por dia/semana (Seg–Dom)
- Separar nomes de farmacêuticos do texto e criar escalas por pessoa
- Exportar relatório Excel/PDF direto do site
