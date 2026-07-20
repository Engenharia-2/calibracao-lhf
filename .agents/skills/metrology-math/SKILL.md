---
name: Metrology & Math (Lógica de Calibração)
description: Diretrizes de negócios, fórmulas matemáticas e tratamento de ponto flutuante para a lógica de calibração e arquitetura abstrata de repositórios.
---

# Lógica de Metrologia e Abstração de Dados

## 1. Regras de Negócio de Calibração
*   **Entidades Isoladas:** A lógica que calcula desvios, incertezas e aprovação/reprovação (Tolerâncias) deve existir em funções TypeScript puras (`src/domain/` ou equivalente), completamente desconectadas de React ou Bancos de Dados.
*   **Ponto Flutuante no JavaScript:** Cuidado extremo com a imprecisão natural de floats no JS (ex: `0.1 + 0.2 === 0.30000000000000004`). Utilize arredondamentos corretos (`toFixed()`, `Math.round`) ou bibliotecas específicas (como `decimal.js` se disponível) para realizar cálculos de Incerteza e Desvio de Equipamentos.
*   **Open/Closed Principle (OCP):** Ao adicionar novos templates de equipamentos (Surge, Megômetro, Hipot), a lógica central de execução não deve ser modificada. O template em si deve ditar os pontos de teste, e o motor apenas itera sobre eles.

## 2. Abstração de Repositórios e Persistência
*   **Dependency Inversion Principle (DIP):** O projeto irá utilizar uma API de banco de dados no futuro. Até lá, crie repositórios que implementem interfaces genéricas (`IEquipmentRepository`, `ICalibrationRepository`).
*   **Sem Acesso Direto:** As regras de negócio não devem conhecer SQLite, Firebase ou LocalStorage. Devem conhecer apenas as interfaces.
*   Injete Mocks ou implementações de "banco de dados embutido" nestas interfaces até a integração oficial com a futura API.
