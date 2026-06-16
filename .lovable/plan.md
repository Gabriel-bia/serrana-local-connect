## Objetivo

Eliminar o uso de `localStorage` como banco de dados. Tudo passa a ser persistido no Lovable Cloud, sincronizado em tempo real entre dispositivos, com login real para o admin e upload de imagens.

## Etapas

### 1. Banco de dados (migration)

Criar as tabelas no schema `public`, espelhando os tipos atuais em `src/data/seed.ts`:

- `categories` (id, name, slug, icon)
- `stores` (id, name, category_id, logo, banner, whatsapp, description, address, hours, blocked, featured, created_at)
- `products` (id, store_id, name, price, image, description, category_id, whatsapp, featured, created_at)
- `services` (id, store_id, name, price, image, description, whatsapp, featured, created_at)
- `banners` (id, image, link, title, active, order_index)
- `service_categories` (id, name, slug, icon)
- `providers` (id, name, photo, cover, description, whatsapp, phone, city, region, hours, networks, category_ids[], featured, blocked, created_at)
- `provider_services` (id, provider_id, name, description, price, image, category_id, duration, active, featured)
- `provider_works` (id, provider_id, title, description, image, date)
- `user_roles` (user_id, role) + enum `app_role('admin')` + função `has_role()`
- `whatsapp_clicks` já existe

Cada tabela em `public` recebe `GRANT` para `anon`, `authenticated`, `service_role` + RLS:
- `SELECT` para `anon` (catálogo público)
- `INSERT/UPDATE/DELETE` apenas se `has_role(auth.uid(), 'admin')`
- Trigger `updated_at` onde fizer sentido
- `ALTER PUBLICATION supabase_realtime ADD TABLE …` em todas

### 2. Storage

- Criar bucket `media` (público) para fotos de lojas, produtos, prestadores, serviços, trabalhos, banners.
- Policy: leitura pública; upload/delete apenas para `admin`.

### 3. Autenticação

- Página `/auth` com email/senha + Google (via `lovable.auth.signInWithOAuth`).
- Configurar provider Google + `auto_confirm_email = true` para simplificar.
- Mover `/admin` para `src/routes/_authenticated/admin.tsx` (e sub-rotas), usando o layout gerenciado pela integração.
- Bootstrap de admin: primeiro usuário a se registrar com um email pré-definido vira admin automaticamente via trigger. Mostro instruções no chat.
- Remover `AdminAuthGate` (senha fixa).

### 4. Camada de dados

Reescrever `src/lib/store.ts`:

- Carrega tudo do Supabase ao montar (server function pública com `SUPABASE_PUBLISHABLE_KEY`).
- Assina Realtime para todas as 9 tabelas e reaplica no estado local.
- `dataApi.upsert/remove` passam a chamar `supabase.from(...).upsert()/delete()` (cliente browser; RLS exige admin logado).
- Mantém a mesma API (`useData`, `dataApi.upsert`, `dataApi.remove`) para minimizar mudanças nas telas.

### 5. Upload de imagens no admin

- Novo componente `ImageUpload` que aceita arquivo, faz upload para `media/`, devolve URL pública e grava no campo.
- Substituir os inputs de URL nos formulários do admin (lojas, produtos, serviços, prestadores, trabalhos, banners) por esse componente — mantendo a opção de colar URL.

### 6. Migração dos dados atuais (preservar conteúdo)

Botão único no admin: "Enviar dados deste dispositivo para a nuvem" — lê o `serrana-express-data-v3` e faz `upsert` em massa nas tabelas. Roda só uma vez, no dispositivo onde estão os dados corretos. Depois disso o localStorage deixa de ser fonte da verdade.

### 7. Limpeza

- Remover gravação automática no `localStorage` como fonte de dados (mantém só para cache temporário enquanto carrega).
- Atualizar `seed.ts` para virar apenas tipos + dados de seed inicial usados pela migração.

## O que NÃO muda

- Aparência, rotas públicas, fluxo do WhatsApp, relatórios, contagem de cliques.
- Telas continuam consumindo `useData()` igual.

## Riscos

- Refatoração grande: muitos arquivos tocados. Vou em uma rodada só, mas pode haver ajustes pontuais depois.
- Depois da migration, você precisa **(a)** criar sua conta na nova tela `/auth`, **(b)** rodar o SQL que te dou no chat para se tornar admin (ou usar o email pré-definido), e **(c)** clicar uma vez no botão de importar dados no dispositivo que tem o catálogo atual.

## Pergunta antes de executar

Qual email você quer que seja promovido a admin automaticamente no primeiro cadastro? (Posso deixar genérico e você roda um SQL depois, mas é mais simples já fixar.)
