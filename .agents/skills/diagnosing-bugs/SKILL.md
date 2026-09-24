---
name: diagnosing-bugs
description: Diagnosticar defeitos, resultados incorretos, falhas intermitentes e regressões de desempenho no front, Electron ou API antes de implementar uma correção.
---

# Diagnóstico disciplinado

Leia o contexto, ADRs e regras de domínio da área afetada. Diagnóstico não autoriza correção, alteração de produção nem instrumentação no NAS, salvo pedido explícito do usuário.

## Processo

1. Construa um sinal reproduzível que possa ficar vermelho: teste, chamada HTTP, fixture, automação de UI ou comparação com uma referência conhecida.
2. Confirme que ele reproduz exatamente o sintoma informado e reduza-o ao menor caso útil.
3. Formule de três a cinco hipóteses ordenadas e falsificáveis. Informe-as ao usuário sem interromper a investigação.
4. Teste uma variável por vez. Prefira debugger e inspeção direcionada; logs temporários recebem prefixo único `[DEBUG-...]`.
5. Ao localizar a causa, descreva a evidência. Só implemente a correção quando o pedido incluir correção.
6. Quando corrigir, transforme a reprodução em teste de regressão, confirme o cenário original e remova toda instrumentação temporária.

## Segurança

- Redija tokens, senhas, assinaturas, dados pessoais e endereços internos em qualquer saída apresentada.
- Não copie `.env` ou payloads sensíveis para o vault.
- Não execute testes, DDL ou sondas de escrita no NAS.
- Se a reprodução depender do ambiente operacional, solicite artefato sanitizado ou autorização específica para observação somente leitura.

Para divergência metrológica, compare a mesma entrada com a planilha ou evidência fornecida; não altere fórmula apenas para coincidir com uma hipótese.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs
