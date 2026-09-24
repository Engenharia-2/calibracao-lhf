---
name: metrology-math
description: Implementar ou revisar cálculos de calibração, incerteza, correção, tolerância, unidades e arredondamento no domínio metrológico.
---

# Lógica metrológica

Antes de alterar fórmulas, leia `../calibracao-knowledge/domain/metrology-rules.md` a partir da raiz de `calibracao-lhf`. Trate os itens marcados para validação como questões abertas, não como requisitos confirmados.

## Implementação

- Mantenha cálculos em funções ou serviços TypeScript puros, sem React, Electron, HTTP ou banco.
- Modele entradas, resultados, unidades e estados inválidos antes da implementação.
- Preserve valores internos sem formatação; arredonde somente nos pontos definidos pela regra. `toFixed()` é formatação de texto, não uma política metrológica por si só.
- Explicite a convenção de sinal de erro ou correção e inclua exemplo numérico.
- Não acrescente condicionais por modelo de equipamento ao motor quando o template puder expressar a variação.
- Não introduza biblioteca decimal sem demonstrar que a política numérica exige precisão decimal exata além do arredondamento controlado.

## Verificação

Toda mudança deve incluir casos de fronteira relevantes:

- valor exatamente no limite;
- valores positivos e negativos;
- zero e campos ausentes;
- mudança de unidade ou escala;
- ponto certificado encontrado e ausente;
- uma e múltiplas repetições;
- efeito do arredondamento próximo à decisão.

Em revisão, refaça ao menos um caso de forma independente e separe defeitos confirmados de dúvidas que dependem do responsável técnico.
