---
name: React UI/UX & Vanilla CSS
description: Regras e padrões para desenvolvimento da camada visual e de UI no projeto de calibração. Acionado em tarefas relacionadas ao Frontend e React.
---

# Diretrizes de UI/UX e Frontend React

## 1. Design System e Estilização
*   **Apenas CSS Vanilla:** Não utilize TailwindCSS ou frameworks CSS externos a menos que explicitamente solicitado pelo usuário.
*   **Design Premium e Moderno:** A interface deve ter cores ricas (Dark Mode elegante, glassmorphism se apropriado), tipografia moderna (ex: Inter, Roboto) e não usar cores padrão de navegador.
*   **Micro-animações:** Adicione efeitos sutis de hover e transições suaves para melhorar a interatividade e a sensação de resposta do aplicativo.

## 2. Princípios SOLID no Frontend
*   **Single Responsibility Principle (SRP):** Componentes React (`src/components/`, `src/pages/`) devem ser "burros" (Dumb Components) sempre que possível. Eles recebem `props` e disparam eventos. Toda a lógica pesada de domínio deve estar em abstrações fora dos componentes.
*   **Separação de Preocupações:** Nunca acesse o Node.js (`fs`, `path`) ou banco de dados diretamente de um componente React. Utilize sempre os wrappers expostos no `window.electron` via `preload.ts`.

## 3. Desempenho em Formulários de Calibração
*   Os formulários de calibração possuem estruturas profundas (Pontos > Ciclos > Leituras).
*   **Mutações e Re-renders:** Evite re-renderizar todo o formulário de calibração a cada digitação (keystroke) em um campo de input. Utilize técnicas de otimização como uncontrolled components, debouncing ou bibliotecas otimizadas para formulários grandes para evitar travamentos de UI.
*   **Imutabilidade:** Quando atualizar o estado (useState/useReducer), nunca modifique os objetos diretamente. Sempre retorne novas referências.
