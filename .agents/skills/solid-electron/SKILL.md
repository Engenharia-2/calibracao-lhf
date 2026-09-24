---
name: solid-electron
description: Implementar ou revisar janelas, preload, IPC e capacidades nativas do Electron com isolamento e contratos mínimos.
---

# Electron e IPC seguro

## Invariantes

- Preserve `contextIsolation: true` e `nodeIntegration: false`.
- Renderer não importa `fs`, `path`, `child_process`, Electron ou outras APIs Node.js.
- Exponha apenas operações específicas pelo `contextBridge`; não exponha `ipcRenderer` cru nem um canal arbitrário.
- Valide origem, canal e payload conforme o risco da operação.
- Mantenha handlers IPC finos e encaminhe trabalho para serviços ou adapters.
- Não envie segredos ou dados pessoais para logs do renderer.

## Alterações coordenadas

Ao criar ou modificar uma operação, revise em conjunto:

1. tipo compartilhado ou contrato;
2. declaração de `window.electron`;
3. função exposta no preload;
4. handler no processo principal;
5. serviço chamado pelo handler;
6. consumidor no renderer;
7. teste do caminho principal e dos erros relevantes.

Evite `any` novo na fronteira. Restrinja listeners a canais conhecidos e sempre disponibilize remoção da assinatura.

## Modo de revisão

Se o agente ativo for somente leitura, não corrija o código. Retorne achados priorizados com arquivo, linha, impacto e validação recomendada. Não transforme preferências de estilo em falhas de segurança.
