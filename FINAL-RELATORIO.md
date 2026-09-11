# Relatório final — auditoria e preparação para lançamento (Serrana Express)

**Leia isto primeiro:** este ambiente de análise não tem acesso de rede. Não foi
possível rodar `npm install`, `npm run build`, `npm run lint`, testes, nem
conectar ao projeto Supabase real. Tudo aqui vem de **leitura estática do
código-fonte**. Nenhuma correção abaixo foi testada em runtime — todas
precisam ser validadas com `npm run build` + `npm run lint` + teste manual
dos fluxos antes de ir para produção. Isso está detalhado na seção 9.

---

## 1. Stack identificada

- **Frontend/SSR**: React 19 + TanStack Start/Router (file-based routing em `src/routes`), Vite 7, Tailwind CSS 4, shadcn/radix.
- **Dados**: Supabase (Postgres + Auth + Storage + Realtime), acessado via `@supabase/supabase-js` no cliente e via um client separado com service role no servidor.
- **Deploy alvo**: Cloudflare Workers (via `nitro`, configurado em `@lovable.dev/vite-tanstack-config`).
- **Infra paralela não usada**: Drizzle ORM (`drizzle/`) com um schema de "staff ops" (roles extras, CRM de clientes, tarefas, aprovações, audit log) que **não está conectado a nenhum código do app**. Parece ser um rascunho de uma fase futura (possivelmente a base para uma área de lojista/operador) que nunca foi finalizada.
- Gerado originalmente pelo Lovable; o `.lovable/plan.md` documenta a migração de `localStorage` para Supabase, que é o estado atual do projeto.

## 2. Arquitetura (como as partes se conectam)

- **Catálogo público** (`categories`, `stores`, `products`, `services`, `providers`, `provider_services`, `provider_works`, `banners`, `store_categories`): leitura pública (RLS `SELECT USING (true)`), escrita restrita a quem tem `has_role(auth.uid(), 'admin')`.
- **Autenticação**: Supabase Auth (`email+senha` e Google OAuth) em `/auth`. O **primeiro usuário que se cadastra vira admin automaticamente** via trigger `bootstrap_first_admin`.
- **Autorização de admin**: tabela `user_roles` (enum `app_role` só tem `'admin'` hoje) + função `has_role()` `SECURITY DEFINER`, usada tanto nas políticas de RLS quanto nas server functions. Isso é o ponto positivo mais importante da auditoria: a autorização real está no banco, não só na tela.
- **Gate de UI** (`AdminAuthGate`): componente client-side que verifica sessão + role e redireciona se não for admin. É só uma camada de UX — a segurança de verdade vem do RLS acima, o que está correto.
- **Painel administrativo único** (`/admin`, `/admin/whatsapp`, `/admin/relatorios`, `/dashboard`): CRUD de categorias, lojas, produtos, serviços, prestadores e banners, mais relatórios de cliques do WhatsApp.
- **Não existe um "painel do lojista" separado do admin.** Conferido no `README.md` original e no `.lovable/plan.md`: o projeto sempre foi desenhado como "vitrine com um painel administrativo simples", gerenciado por um único administrador. Ver seção 6 para detalhes e recomendação.
- **Camada de dados do frontend** (`src/lib/store.ts`): um "store" global em memória que carrega **todas as linhas de todas as 9 tabelas** de uma vez (`select("*")` sem paginação) na primeira renderização, e mantém tudo sincronizado via Supabase Realtime (`postgres_changes` nas 9 tabelas). Todas as páginas (Home, listagens, detalhe de produto/loja/prestador, admin) consomem esse mesmo store via `useData()`.
- **Server functions** (`src/lib/*.functions.ts`, via `createServerFn` do TanStack Start): usadas para os relatórios de WhatsApp, que exigem o service-role key. Corretamente exigem um Bearer token válido e checam `has_role(..., 'admin')` **no servidor** antes de usar a service role key — isso está bem feito.
- **Storage**: bucket `media` já tem as policies certas no banco (leitura pública, escrita só admin), mas **nunca é usado pelo código** — ver seção 5.

## 3. Bugs encontrados e corrigidos

| # | Bug | Onde | Correção |
|---|---|---|---|
| 1 | `window.open(url, "_blank")` sem `noopener,noreferrer` ao abrir o WhatsApp a partir dos cards de produto/serviço — risco de *reverse tabnabbing* (a aba aberta podia manipular `window.opener`). | `ProductCard.tsx`, `ServiceOfferCard.tsx` | Adicionado `"noopener,noreferrer"` como terceiro argumento. |
| 2 | Mensagem padrão do WhatsApp não incluía o texto pedido ("Olá, vim pelo app Serrana Express"); cada tela usava um texto diferente e nenhuma tinha a frase institucional. | `loja.$id.tsx`, `prestador.$id.tsx`, `produto.$id.tsx`, `ProductCard.tsx`, `ServiceOfferCard.tsx` | Padronizado o prefixo `"Olá, vim pelo app Serrana Express! ..."` mantendo o contexto (nome da loja/produto/serviço) em todas as 5 origens de clique. |
| 3 | `<html lang="en">` num site 100% em português. | `src/routes/__root.tsx` | Corrigido para `lang="pt-BR"`. |
| 4 | Meta tag `twitter:site` apontando para `@Lovable` (a ferramenta que gerou o projeto), não para a marca Serrana Express. | `src/routes/__root.tsx` | Removida. |
| 5 | `.env` sem entrada correspondente no `.gitignore` (o arquivo estava presente no pacote enviado, ou seja, provavelmente commitado no repositório). | `.gitignore` | Adicionado `.env` / `.env.*` ao `.gitignore` e criado `.env.example` documentando as variáveis necessárias sem valores reais. **Ação manual necessária**: rodar `git rm --cached .env` no repositório real para parar de versioná-lo (ver seção 9). |

Bugs que o pedido original mencionava (cadastro, login, navegação, filtros, uploads, painel administrativo, mobile/desktop) foram **revisados por leitura de código** e não apresentaram bugs funcionais óbvios além dos listados acima e dos itens de segurança na seção 4. Isso não substitui teste manual real — ver seção 9 sobre o que não pôde ser verificado.

## 4. Vulnerabilidades encontradas e corrigidas

### 🔴 Crítica — senha de administrador hardcoded (CORRIGIDA)
`src/lib/admin-auth.functions.ts` continha:
```ts
const adminPassword = process.env.SERRANA_ADMIN_PASSWORD ?? "Gbcgarcia12";
```
E `src/lib/admin-auth.server.ts` tinha um segredo de sessão com fallback fixo:
```ts
password: process.env.ADMIN_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "serrana-express-admin-session-secret-fallback-2026",
```
Isso era um **segundo sistema de login para admin**, completamente separado do Supabase Auth + `user_roles` que o resto do app usa. Confirmei por busca em todo o código que **nada importava essas funções** — não havia nenhum botão, formulário ou rota chamando `loginAdmin`/`requireAdminSession`. Como são `createServerFn` do TanStack Start, mesmo sem uso na UI elas podiam virar endpoints HTTP reais no servidor, ou seja, era uma porta dos fundos esquecida com senha em texto puro no código-fonte.

O próprio `.lovable/plan.md` já documentava a intenção de remover esse gate antigo ("Remover AdminAuthGate (senha fixa)") quando o projeto migrou para Supabase Auth — ou seja, isso é código morto de uma versão anterior que nunca foi limpo.

**Correção**: os dois arquivos foram **removidos**. O único caminho de autenticação de admin que resta é o Supabase Auth + `user_roles`, que é validado no banco (RLS), não só na tela.

### 🟠 Alta — nenhum header de segurança HTTP (CORRIGIDA)
Não havia CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` nem `Strict-Transport-Security` em nenhuma resposta.

**Correção**: adicionados em `src/server.ts`, no handler `fetch` mais externo (cobre SSR, assets estáticos e server functions). O CSP libera o domínio do Supabase (REST + Realtime via WebSocket) para `connect-src`, e usa `'unsafe-inline'` em `script-src`/`style-src` porque o framework de SSR injeta dados de hidratação inline — uma CSP mais restrita, baseada em nonce, exigiria suporte específico do framework que não pude configurar/testar aqui.
**Isso precisa ser testado em produção** (abrir o console do navegador e confirmar que nada é bloqueado pela CSP) antes de confiar nele — ver seção 9.

### 🟡 Média — uploads de imagem não usam o Storage (CORRIGIDA, ver seção 5)

### 🟡 Média — sinalização, não corrigida: cadastro público sem controle após o primeiro admin
`/auth` permite que qualquer visitante crie conta. O primeiro cadastro vira admin automaticamente; cadastros seguintes viram usuários autenticados comuns, que pelo RLS **não conseguem escrever em nada** (só admins podem). Ou seja, não há escalonamento de privilégio possível por aqui — mas existe uma janela de risco real: **se o site for publicado antes do dono se cadastrar como admin**, qualquer pessoa que descubra a URL `/auth` primeiro vira o admin permanente do site. Recomendação para o checklist de lançamento (seção 10): cadastre a conta do administrador **antes** de tornar o site público, ou desative o self-signup no painel do Supabase depois disso.

### 🟡 Média — sem rate limiting em `whatsapp_clicks` (não corrigida)
A policy de INSERT em `whatsapp_clicks` é pública (`anon`/`authenticated`), só valida tamanho de string, sem limite de frequência por IP/sessão nem verificação de que o `store_id` realmente existe. Isso permite inflar/poluir as métricas de cliques ou, em menor escala, gerar lixo na tabela. Corrigir isso direito exigiria uma function/trigger no Postgres com rate limiting (ex.: por IP via Edge Function) — não implementei às cegas porque não há como testar contra o projeto Supabase real neste ambiente. Recomendo tratar isso no Supabase (rate limiting a nível de Edge Function ou de API Gateway) antes do lançamento se o volume de tráfego justificar.

### 🟢 Baixa — `.env` sem `.gitignore` (CORRIGIDA, ver bug #5 acima)
Os valores presentes no `.env` enviado são a URL e a **publishable/anon key** do Supabase — essas chaves já são expostas ao navegador por design (é assim que o cliente Supabase funciona no frontend), então não houve vazamento de segredo real aqui. A **service role key não estava no `.env`**, o que é o comportamento correto (ela só é lida de `process.env.SUPABASE_SERVICE_ROLE_KEY` no servidor, em `client.server.ts`, nunca em uma variável `VITE_*`). Ainda assim, versionar `.env` é má prática — corrigido.

### O que foi verificado e está OK (não precisou de correção)
- RLS de todas as tabelas do catálogo: leitura pública, escrita só admin — consistente.
- `client.server.ts` (service role key) só é importado dinamicamente dentro de server functions que já validaram admin — a key nunca chega ao bundle do cliente (confirmado pelo sufixo `.server.ts`, que o Vite exclui do bundle client-side).
- `getStoreReport` e `getWhatsappStats`: exigem Bearer token válido (`requireSupabaseAuth`) e checam `has_role(admin)` no servidor antes de usar a service role key.
- Mensagens de erro genéricas para o usuário (`error-page.ts`) — nenhum stack trace ou detalhe interno é exposto; os detalhes reais só vão para `console.error` do servidor.
- Links de WhatsApp usam `target="_blank" rel="noopener noreferrer"` no componente principal (`WhatsAppButton.tsx`) — só faltava nos dois `window.open` manuais, já corrigidos.
- Bucket `media`: policies de storage corretas (leitura pública, escrita/edição/exclusão só admin).

## 5. Melhorias de performance implementadas

**Upload de imagem agora vai para o Supabase Storage, não mais para base64 na coluna do banco.**

Antes, `ImageUploadField` (usado em todo o cadastro de produtos/lojas/prestadores/serviços/banners no admin) comprimia a imagem no navegador e salvava o resultado como uma string base64 **diretamente na coluna `image`/`logo`/`banner`/`photo`** do Postgres. Isso significa que toda vez que qualquer página carrega a lista de produtos/lojas/prestadores (que é sempre, porque `useData()` carrega tudo de uma vez — ver seção 6), ela baixa o binário completo de cada imagem embutido no JSON da resposta. Com centenas de produtos isso vira uma resposta de dezenas de MB.

O bucket `media` no Supabase Storage **já estava criado e com as policies certas** (leitura pública, escrita só para admin) desde a migração original — só não era usado por nenhum código. Implementei o upload real: a imagem comprimida agora vai para `media/uploads/<timestamp>-<uuid>.<ext>` e o campo no banco passa a guardar só a **URL pública** (uma string curta), do mesmo jeito que já funcionava para imagens coladas por URL.

- **Compatibilidade**: dados antigos em base64 continuam funcionando normalmente (o `<img src>` aceita tanto `data:` URLs quanto URLs públicas), então nada quebra para produtos já cadastrados.
- **Fallback de segurança**: se o bucket `media` ainda não existir no projeto Supabase real (por exemplo, se só a policy foi migrada mas o bucket em si nunca foi criado no dashboard), o upload cai de volta pro base64 antigo, com um aviso no console — para não travar o cadastro de ninguém.
- **Não testado contra o Supabase real** (sem rede neste ambiente). Antes de confiar nisso em produção: confirme no dashboard do Supabase que o bucket `media` existe e é público, cadastre uma imagem de teste no `/admin` e confira no Network tab que a imagem final é uma URL `https://.../storage/v1/object/public/media/...` e não mais uma string `data:image/...;base64,...` enorme.

## 6. Funcionalidades incompletas / não implementadas — sendo honesto

O prompt original pede uma "área do lojista" separada do painel administrativo, onde cada lojista só edita a própria loja. **Isso não existe hoje no projeto** — nem como código, nem como modelo de dados (o enum `app_role` só tem o valor `'admin'`; não existe um conceito de "dono de loja" vinculado a um `user_id`). O `README.md` original e o plano do Lovable confirmam que o projeto sempre foi desenhado como "um administrador só, cadastra tudo".

Eu **não implementei um sistema multi-tenant de lojistas às cegas** nesta passagem, porque:
1. Seria uma mudança de arquitetura grande (nova coluna `owner_id` em `stores`, novo valor de role, novas policies de RLS por loja, novas telas), não uma correção de bug.
2. Não tenho como testar isso contra um banco Supabase real neste ambiente — um erro de RLS mal escrito poderia vazar dados de uma loja para outra, exatamente o tipo de vulnerabilidade que o pedido original quer evitar.
3. Fazer isso "no escuro" e entregar sem testar seria pior do que documentar claramente que falta.

**O que já existe como base para isso**: o schema não usado do Drizzle (`drizzle/migrations/0001_admin_ops_phase1.sql`) já desenha algo parecido — roles `operator`/`viewer`, uma tabela `admin_requests` (lojista pede uma alteração, admin aprova) e uma `audit_log`. Isso parece ter sido um rascunho de exatamente esse recurso. Recomendo, se a área do lojista for prioridade, usar esse desenho como ponto de partida (fluxo de solicitação/aprovação é mais seguro de implementar do que dar escrita direta a cada lojista) — mas isso precisa de uma sessão dedicada, com acesso ao Supabase real para migrar e testar o RLS com cuidado.

## 7. O que **não** foi alterado por falta de forma segura de testar

- **`loadAll()` em `src/lib/store.ts` carrega todas as linhas de todas as 9 tabelas de uma vez**, sem paginação, e assina Realtime nas 9 tabelas. Isso é citado explicitamente no pedido original ("não carregue todos os dados de uma vez") e é, na minha avaliação, **a maior causa estrutural de lentidão em escala** (10 → 1000 lojas). Corrigir isso direito significa reescrever a camada de dados para paginação/consulta sob demanda por rota, o que toca praticamente todas as páginas do site. Não fiz essa reescrita às cegas, sem `npm run build`/teste real, porque o risco de quebrar o site inteiro é alto. **Recomendação concreta**: paginar consultas por rota (ex.: página de produtos busca 24 por vez com `.range()`, home busca só os destaques), carregar detalhe de produto/loja/prestador com uma query própria em vez de filtrar o array gigante em memória, e reavaliar se todas as 9 tabelas precisam de Realtime (o catálogo público provavelmente não precisa atualizar em tempo real para o visitante).
- **SEO por página**: `produto.$id.tsx`, `loja.$id.tsx` e `prestador.$id.tsx` não têm `head()`/meta própria — toda página de detalhe usa o mesmo título/descrição genéricos do site. Isso está ligado ao ponto anterior: os dados desses componentes só chegam via `useData()` no cliente, não há loader de servidor buscando o registro específico, então não dá para montar um `<title>`/`<meta>` correto no HTML gerado no servidor sem antes resolver o carregamento de dados por rota. Não fiz essa mudança agora pelo mesmo motivo de risco/teste.
- **Sitemap dinâmico**: não implementado (precisaria de acesso ao Supabase real para listar produtos/lojas publicados). Criei um `robots.txt` estático em `public/robots.txt` com um `TODO` marcando onde adicionar a linha `Sitemap:` quando o domínio de produção for definido.
- **`npm audit` / atualização de dependências**: não pude rodar (sem rede). O `package.json` usa versões relativamente recentes (React 19, Vite 7, Supabase JS 2.106) — não há como confirmar CVEs sem rodar `npm audit` ou `npm outdated` no ambiente real.
- **Rate limiting / proteção de força bruta no login**: o Supabase Auth já tem rate limiting nativo em `signInWithPassword`, então isso é coberto pela plataforma, não pelo código do app. Recomendo revisar no dashboard do Supabase se "Leaked password protection" e CAPTCHA (hCaptcha/Turnstile) estão habilitados antes do lançamento — é configuração, não código.

## 8. Dependências

Não alterei nenhuma versão no `package.json`. Sem rede neste ambiente não há como rodar `npm outdated`/`npm audit` nem reinstalar com segurança para confirmar que uma atualização não quebra nada — alterar versões às cegas, sem poder rodar o build depois, seria arriscado demais. Recomendo rodar isso manualmente antes do lançamento:
```sh
npm audit
npm outdated
```

## 9. Testes realizados vs. não realizados (leia com atenção)

**Não realizado — sem acesso de rede neste ambiente:**
- `npm install` / `npm run build` / `npm run dev` / `npm run lint`
- Qualquer teste end-to-end real (cadastro, login, logout, recuperação de senha, CRUD no admin, upload de imagem, cliques de WhatsApp, responsividade)
- Conexão com o projeto Supabase real (não dá pra confirmar se o bucket `media` existe, se as migrations em `supabase/migrations` foram todas aplicadas, ou o estado atual de `user_roles`)
- Medição de Core Web Vitals (FCP, LCP, CLS, TBT) — não invento números aqui.
- Teste da CSP nova em um navegador real (headers podem bloquear algo que não previ)

**Realizado nesta auditoria:**
- Leitura completa do código-fonte (rotas, componentes, lib, integrações, migrations SQL) e do schema do banco via os arquivos de migration.
- Rastreamento manual de todos os caminhos de autenticação/autorização (admin, RLS, server functions) para confirmar onde a autorização realmente acontece.
- Busca por padrões de risco conhecidos: segredos hardcoded, `dangerouslySetInnerHTML`, `eval`, `window.open` sem `noopener`, uso de `service_role` fora do server, políticas RLS abertas (`USING (true)` em escrita), CORS, headers de segurança, `.env` versionado.
- As correções de código foram revisadas visualmente (sem erros de sintaxe óbvios), mas **não foram compiladas nem executadas**.

**Antes de ir para produção, rode obrigatoriamente:**
```sh
npm install
npm run lint
npm run build
npm run dev   # e teste manualmente os fluxos da seção "Checklist" abaixo
```

## 10. Variáveis de ambiente necessárias em produção

Documentadas em `.env.example` (novo arquivo, sem valores reais):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` — públicas, usadas pelo cliente.
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` — mesmas, lidas no servidor (SSR).
- `SUPABASE_SERVICE_ROLE_KEY` — **secreta**, nunca prefixar com `VITE_`, usada só nos relatórios de admin.

As variáveis antigas `SERRANA_ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` **não são mais necessárias** — o sistema que as usava foi removido (seção 4).

## 11. Checklist final de lançamento

- [ ] Rodar `npm install && npm run lint && npm run build` e corrigir qualquer erro que aparecer (não verificado neste ambiente).
- [ ] Confirmar no dashboard do Supabase que o bucket de Storage **`media`** existe e está marcado como público; testar um upload real pelo `/admin` e confirmar que a URL salva é `https://.../storage/v1/object/public/media/...`.
- [ ] Cadastrar a conta do administrador real em `/auth` **antes** de divulgar o site publicamente (o primeiro cadastro vira admin automaticamente).
- [ ] Depois disso, considerar restringir/desativar novos cadastros públicos em `/auth` se não fizerem sentido para o produto (o site não precisa de conta para o visitante comum).
- [ ] Definir `SUPABASE_SERVICE_ROLE_KEY` como secret no ambiente de produção (Cloudflare) — nunca em `.env` versionado.
- [ ] Rodar `git rm --cached .env` no repositório real (o `.gitignore` já foi corrigido, mas isso não remove o que já foi commitado antes).
- [ ] Testar a CSP nova em produção — abrir o console do navegador em todas as páginas principais e no `/admin` e confirmar que nada foi bloqueado.
- [ ] Revisar no dashboard do Supabase: proteção contra senha vazada e CAPTCHA no login/cadastro.
- [ ] Definir domínio final e adicionar a linha `Sitemap:` no `public/robots.txt`.
- [ ] Decidir o que fazer com o schema não usado em `drizzle/` (finalizar como base da área do lojista, ou remover para não confundir).
- [ ] Priorizar, como próximo passo de performance, a paginação da camada de dados (`src/lib/store.ts`) antes do catálogo crescer muito — ver seção 7.
- [ ] Testar manualmente, num ambiente com Supabase real: cadastro, login, logout, CRUD de produtos/lojas/serviços/prestadores/banners, upload de imagem, cliques de WhatsApp, responsividade mobile/desktop.

---

### Resumo em uma frase
A base de autorização (RLS + `has_role`) está sólida; o problema mais grave era uma senha de admin esquecida no código (removida); o maior risco de performance em escala é a camada de dados carregar tudo de uma vez (documentado, não reescrito às cegas); e a "área do lojista" pedida no escopo original simplesmente não existe neste projeto hoje — precisa ser uma decisão de produto antes de virar código.
