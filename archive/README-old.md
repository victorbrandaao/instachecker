# InstaChecker

Ferramenta simples para comparar seguidores e seguindo do Instagram. Todo processamento é feito no navegador — nenhum dado é enviado a servidores.

## Recursos
- Importação de ZIP/JSON do Instagram
- Identifica quem não segue de volta, quem te segue sem retribuir e seguidores em comum
- Exporta CSV / copia listas
- PWA básica (instalável)
- Deploy automático via GitHub Actions → Vercel

## Rápido começo
Pré-requisitos: Node 18+ e npm.

1. Instalar dependências
   ```
   npm ci
   ```
2. Testar lint (opcional)
   ```
   npm run lint
   ```
3. Abrir localmente (modo static)
   ```
   npx http-server ./ -p 8080
   # depois acesse: http://localhost:8080/instachecker/
   ```

## Deploy
O deploy está configurado por GitHub Actions para o Vercel. Adicione estes secrets no repositório (Settings → Secrets):
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

## Analytics (opcional)
- GA4: cole o snippet do gtag no `<head>` do `index.html`.
- Plausible: cole o snippet do plausible no `<head>`.

> Nota: Vercel Analytics exige Next.js para integração nativa.

## Contribuição
- Mantém o `node_modules/` no `.gitignore`.
- Preferência por PRs pequenos e testes para funções críticas.

## Licença
MIT
