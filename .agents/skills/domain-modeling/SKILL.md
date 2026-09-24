---
name: domain-modeling
description: Refinar termos, relações e decisões do domínio de calibração. Use ao discutir conceitos de negócio, atualizar glossário/contexto ou decidir relações como calibração, template, seção, leitura e padrão.
---

# Modelagem do domínio

Use o vault `calibracao-knowledge` como fonte canônica:

- `context/glossary.md` para linguagem comum;
- `domain/` para regras e relações;
- `decisions/` para decisões duráveis;
- `architecture/` somente para implementação técnica.

## Disciplina

- Questione termos vagos ou sobrecarregados e proponha um nome canônico.
- Teste relações com cenários concretos, cardinalidade, histórico, ausência de dados e mudanças ao longo do tempo.
- Compare afirmações com o código e os formatos persistidos. Exponha divergências antes de escolher uma versão.
- Registre uma definição resolvida imediatamente no glossário ou documento de domínio correspondente.
- Não transforme `CONTEXT.md` em especificação; ele é um ponto de entrada para o vault.

Crie ADR somente quando a decisão for difícil de reverter, surpreendente sem contexto e resultado de um trade-off real. Caso contrário, atualize domínio, arquitetura ou worklog conforme a natureza da informação.

Decisões metrológicas sem validação técnica devem permanecer explicitamente marcadas como baseline operacional ou questão aberta.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling
