---
name: grill-with-docs
description: Conduzir uma entrevista estruturada e atualizar documentação de domínio durante o refinamento. Use somente quando o usuário pedir explicitamente para aprofundar, entrevistar ou eliminar ambiguidades antes de uma mudança relevante.
---

# Descoberta guiada com documentação

Use para decisões com impacto relevante, como aquisição Serial/USB, novas regras metrológicas, papéis de usuário, versionamento de templates ou mudanças de fluxo. Não use para bugs claros, ajustes pequenos ou tarefas já suficientemente especificadas.

## Processo

1. Leia glossário, domínio, arquitetura e ADRs da área antes de perguntar.
2. Faça uma pergunta curta por vez, escolhendo a que mais reduz incerteza ou risco.
3. Explore objetivo, atores, fluxo normal, estados inválidos, limites, histórico, permissões e critérios de aceite.
4. Confronte respostas com o código e documentos existentes. Mostre contradições concretas.
5. Continue até que as decisões necessárias estejam resolvidas ou claramente marcadas como pendentes.
6. Atualize durante a conversa:
   - termo resolvido → `context/glossary.md`;
   - regra → `domain/`;
   - arquitetura → `architecture/`;
   - trade-off durável → ADR;
   - histórico → `worklog/`.
7. Encerre com decisões, questões abertas, fora de escopo e próximos passos.

Não invente conhecimento metrológico que o proprietário ou os técnicos não confirmaram. Uma resposta desconhecida pode permanecer como questão aberta sem impedir decisões independentes.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs
