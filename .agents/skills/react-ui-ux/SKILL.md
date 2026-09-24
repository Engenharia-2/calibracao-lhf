---
name: react-ui-ux
description: Implementar ou revisar telas e componentes React do Calibração LHF usando o sistema visual existente e CSS vanilla.
---

# React UI/UX e CSS vanilla

Antes de criar estilos, trace a tela até seus CSS, componentes compartilhados e estados visuais. Reutilize tokens, classes e componentes já governantes; não invente uma segunda linguagem visual.

## Implementação

- Use CSS vanilla. Não adicione framework de estilos sem solicitação explícita.
- Componentes apresentam dados e eventos; extraia coordenação complexa para hooks e regras de negócio para o domínio.
- Não acesse Node.js, banco ou `fetch` diretamente em componentes.
- Modele estados de carregamento, vazio, erro, sucesso e desabilitado quando forem alcançáveis.
- Preserve navegação por teclado, foco visível, rótulos e contraste nas alterações relevantes.
- Use atualizações imutáveis para pontos, ciclos e leituras.

## Formulários grandes

Não aplique memoização, debounce ou inputs não controlados por suposição. Primeiro identifique o re-render ou atraso observável; então escolha a menor otimização que preserve validação, foco e consistência do estado.

## Verificação

Teste o comportamento alterado no menor nível útil. Para mudanças visuais, confira os tamanhos de janela relevantes e estados da própria tela, sem extrapolar uma revisão local para todo o produto.
