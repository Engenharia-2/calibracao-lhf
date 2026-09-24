---
name: wizard
description: Criar um assistente PowerShell para procedimentos manuais repetíveis, como configurar ambiente, coletar credenciais, preparar backup ou conduzir migration/cutover. Não use para executar diretamente ações que o agente já pode realizar com segurança.
---

# Wizard operacional em PowerShell

Crie um script que guie uma pessoa por etapas manuais e verificáveis. O wizard orienta; não transforma aprovação genérica em autorização para alterar sistemas externos.

Para banco e NAS, leia `calibracao-api/database/operations/NAS-RUNBOOK.md` e `calibracao-knowledge/architecture/database.md`.

## Processo

1. Inspecione configurações e documentação existentes antes de perguntar.
2. Liste as etapas, entradas produzidas e onde cada valor será usado. Marque segredos.
3. Confirme com o usuário o percurso antes de criar um fluxo que inclua ação irreversível ou ambiente operacional.
4. Parta de `assets/wizard-template.ps1` e substitua apenas a seção indicada.
5. Use entrada segura para segredos, valide pré-condições e apresente o alvo antes de cada mutação.
6. Exija confirmação imediatamente antes de qualquer ação irreversível. Para o NAS, exija autorização específica mesmo que a etapa geral já tenha sido aprovada.
7. Torne as etapas idempotentes quando possível e gere um resumo sem valores secretos.

O script é descartável por padrão. Só o versione quando representar um procedimento recorrente solicitado pelo usuário. Nunca grave senha, token, assinatura ou endereço interno no vault ou em saída exibida.

Adaptada de: https://github.com/mattpocock/skills/tree/main/skills/engineering/wizard
