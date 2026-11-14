# Roadmap

- [x] Add administrative search, category/status filters and clear controls to existing listings.
- [x] Persist product activation, preserve category relationships, and validate administrative flows on desktop/mobile.

- [x] Retorno inteligente e compartilhamento público das lojas e prestadores
- [x] Linha exclusiva de destaques e ordem aleatória estável durante a navegação
- [x] Seleção múltipla por toque prolongado e compartilhamento dos produtos da loja
- [x] Validar regras, links diretos, navegação e seleção no computador e celular (simulado), como visitante e com sessão conectada

- [x] Diagnóstico do atraso inicial (dados carregavam só no navegador, depois da abertura da página)
- [x] Investigação do agente (causa: carregamento exclusivamente no navegador)
- [x] Carregar catálogo pelo servidor (SSR) — HTML da home caiu de ~24 MB para ~240 KB
- [x] Migrar 78 imagens do banco para o armazenamento de arquivos (bucket público catalog-images)
- [x] Salvamentos futuros enviam imagens ao armazenamento automaticamente (uploadCatalogImage + dataApi)
- [x] Tela de carregamento com logo SE e mensagem "Personalizando os melhores produtos para você"
- [x] Typecheck sem erros
- [x] Validar a página inicial no navegador (sem erros; produtos e prestadores aparecem)
