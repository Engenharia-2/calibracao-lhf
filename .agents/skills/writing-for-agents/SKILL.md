---
name: writing-for-agents
description: Criar ou revisar AGENTS.md, skills, instruções de agentes e documentos apontados por eles no ecossistema do projeto de calibração.
---

# Escrita para agentes

Antes de editar, localize todos os consumidores da instrução e preserve a hierarquia vigente:

1. `AGENTS.md`: invariantes permanentes e ponteiros curtos.
2. `.agents/skills`: procedimentos acionados por tipo de tarefa.
3. `.codex/agents`: papéis especializados e seus limites.
4. `calibracao-knowledge`: fatos, domínio, arquitetura, decisões e histórico.

## Regras

- Escreva somente instruções que mudem decisões ou evitem um erro plausível.
- Dê a cada ponteiro uma condição clara de uso; o texto do ponteiro determina quando o agente buscará o documento.
- Coloque passos essenciais no `SKILL.md` e detalhes condicionais em `references/`.
- Não duplique a mesma regra em várias camadas. Mantenha uma fonte canônica e referências explícitas.
- Descrições de skills devem distinguir quando usar e evitar escopo genérico.
- Preserve intenção do usuário e limites de autorização; uma skill não amplia permissões externas.
- Use termos do glossário e caminhos relativos válidos a partir do repositório consumidor.

Ao criar ou alterar uma skill, valide frontmatter, nome, caminhos, gatilho, conflitos com `AGENTS.md` e comportamento esperado. Atualize `context/ai-workflow.md` quando a arquitetura de instruções mudar.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents
