---
name: SOLID & Electron IPC (QA/Arquitetura)
description: Regras estritas de arquitetura limpa, SOLID e segurança no Electron (IPC, preload.ts). Usado em inspeção de código e desenvolvimento Core.
---

# Inspeção de Qualidade (QA), Arquitetura e Electron

## 1. Segurança e Comunicação (Electron)
*   **Isolamento Contextual (`contextIsolation: true`):** É estritamente proibido utilizar `require` ou APIs nativas do Node.js (como `fs`, `child_process`) dentro da pasta `src/` (Renderer).
*   **Ponte Segura (`preload.ts`):** Toda comunicação entre o Renderer (React) e o Main Process (Node) deve ocorrer via `contextBridge`.
*   **IPC Handlers (Main):** No processo principal, mantenha os *handlers* de IPC organizados e leves. O Main Process deve apenas receber o pedido, repassar para a camada de Serviço/Domínio e devolver o resultado ao Renderer.

## 2. Padrões Arquiteturais e de Revisão de Código
Esta *skill* define o baseline para o Agente de QA (Quality Assurance) avaliar os Pull Requests ou edições locais:
*   **Checagem SOLID:** O QA deve apontar falhas de SRP (classes/componentes com múltiplos motivos para mudar), OCP (arquivos core precisando ser alterados para introduzir um equipamento novo) e DIP (acoplamento com frameworks).
*   **Limpeza e Clareza:** Rejeite variáveis com nomes ruins e uso de "Magic Numbers". Exija constantes e enumerações TypeScript.
*   **Sem Modificações (Somente Leitura):** Agentes invocados com perfil de QA **não devem** tentar corrigir o código sozinhos. Seu papel é expor os defeitos arquiteturais, sugerir a solução adequada (citando o arquivo e linha) e aguardar que o desenvolvedor ou agente apropriado corrija.
