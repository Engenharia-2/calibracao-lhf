---
name: code-review
description: Revisar diffs, branches ou alterações em andamento do sistema de calibração quanto a requisitos, padrões do repositório, segurança e regressões. Use quando o usuário pedir revisão de código ou de uma etapa concluída.
---

# Revisão de código em dois eixos

Permaneça em somente leitura, a menos que o usuário também solicite correções.

## Preparação

1. Fixe a base de comparação. Para alterações não commitadas, use `HEAD`; para branch ou intervalo, use a referência informada pelo usuário.
2. Identifique a especificação nesta ordem: pedido atual, documento indicado, roadmap/worklog/ADR no vault e mensagens de commit.
3. Leia o `AGENTS.md` do repositório e as skills específicas da área.

## Eixos

- **Conformidade:** comportamento atende ao pedido, contratos e decisões registradas?
- **Engenharia:** há regressão, falha de segurança, fonte duplicada de verdade, tratamento de erro inadequado, acoplamento ou teste ausente?

Use revisores especializados somente quando o usuário pedir delegação ou quando as instruções ativas autorizarem agentes. Caso contrário, execute ambos os eixos localmente.

## Saída

Apresente primeiro achados acionáveis, ordenados por severidade, com arquivo, linha, cenário e impacto. Separe defeitos comprovados, riscos e dúvidas de domínio. Não trate preferências de estilo como defeitos e não repita o que lint ou TypeScript já comunicam sem acrescentar impacto.

Se não houver achados, diga isso explicitamente e informe lacunas de validação remanescentes. Inclua um resumo secundário apenas depois dos achados.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review
