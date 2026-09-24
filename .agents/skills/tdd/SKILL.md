---
name: tdd
description: Desenvolver funcionalidades e corrigir defeitos do sistema de calibração em ciclos teste-falhando, implementação mínima e refatoração. Use quando houver mudança observável de comportamento ou pedido explícito de TDD/test-first.
---

# TDD no sistema de calibração

Leia `calibracao-knowledge/quality/testing-strategy.md` e o documento de domínio relacionado. Em mudanças metrológicas, leia também `domain/metrology-rules.md` e a skill `metrology-math` do frontend.

## Ciclo

1. Identifique a interface pública em que o comportamento é observável. Prefira domínio, caso de uso, endpoint ou integração IPC; evite métodos privados.
2. Declare brevemente o comportamento e a fronteira do teste. Peça decisão somente quando a escolha alterar o produto ou o contrato público.
3. Escreva um teste pequeno que falhe pelo motivo esperado e execute-o para confirmar o vermelho.
4. Implemente apenas o necessário para fazê-lo passar.
5. Execute o teste focado e depois as verificações proporcionais ao risco.
6. Refatore sem alterar comportamento e mantenha a suíte verde.

## Qualidade dos testes

- Verifique comportamento por interfaces públicas, não detalhes internos.
- Use valores esperados independentes da implementação. Para metrologia, prefira exemplos aprovados, planilhas de referência ou resultados confirmados pelos técnicos.
- Não replique no teste a mesma fórmula usada pelo código.
- Use doubles para dependências externas em testes unitários.
- Trabalhe em fatias verticais: um comportamento, um teste e uma implementação por ciclo.
- Testes automatizados nunca apontam para o MariaDB do NAS.

Se não for possível produzir um teste que realmente detecte a regressão, registre a limitação; não crie um teste que apenas parece oferecer cobertura.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd
