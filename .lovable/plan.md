# Acelerar a abertura do catálogo

## Objetivo
Fazer produtos, lojas e prestadores aparecerem mais rapidamente ao abrir o site, sem remover a atualização em tempo real.

## Alterações
- Separar o carregamento inicial em duas etapas: primeiro os textos, preços e vínculos necessários para montar a página; depois as imagens pesadas.
- Evitar baixar imagens grandes embutidas antes de mostrar os produtos.
- Manter as tentativas automáticas em falhas de conexão e a sincronização em tempo real.
- Validar a página inicial em desktop e celular, confirmando que o conteúdo aparece antes das imagens terminarem de carregar.

## Detalhes técnicos
- Ajustar o carregador central para aceitar consultas leves por tabela.
- Fazer a segunda etapa mesclar os dados completos no estado atual, preservando a interface já exibida.
- Conferir erros de compilação, navegador e rede após a mudança.
