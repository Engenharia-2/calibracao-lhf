# Project Context: Electrical Equipment Calibration System

## 1. Project Overview
This project is a desktop application designed to manage, execute, and record calibrations for electrical measurement equipment (e.g., Surge Testers). It replaces static spreadsheets with a dynamic, robust software solution. 

The application is built as a native desktop app using **Electron**, with the presentation layer developed in **React (via Vite)**, and strictly typed using **TypeScript**.

## 2. Core Domain & Business Rules
The system operates around two main concepts to ensure scalability and adherence to the Open/Closed Principle:
* **Calibration Templates:** Definitions of how a specific equipment model is calibrated. It dictates the test points (e.g., 1kV, 3kV, 15kV), the number of required measurement cycles, formulas for deviation, and Maximum Permissible Errors (tolerances).
* **Calibration Execution (Records):** The actual instance of a test performed on a bench. It binds a Template to a specific Device Under Test (DUT) using its Serial Number, and records the environment variables (Temperature, Humidity, AC Voltage) and the Operator.

### Metrological Requirements:
* Each test point requires the input of two variables: **Standard** (Padrão - the reference value) and **Set** (Conjunto - the value read by the DUT).
* The system must dynamically calculate deviations and validate them against the template's tolerances.
* The architecture must anticipate the future implementation of automated data collection via Serial/USB communication, meaning manual input and automated input must share the same underlying interfaces.

## 3. Tech Stack & Environment
* **Environment:** Electron (Main Process + Renderer Process).
* **Frontend Framework:** React 18+ bundled with Vite.
* **Language:** TypeScript (Strict Mode enabled).
* **Inter-Process Communication (IPC):** Strict separation between Node.js APIs (Main) and the UI (Renderer). All communication must happen via `contextBridge` and explicit preload scripts.

## 4. Architectural Guidelines & SOLID Principles
AI agents contributing to this codebase MUST adhere strictly to the following principles:

* **Single Responsibility Principle (SRP):** 
  * UI components must only handle rendering.
  * Business logic (e.g., calculating deviations, validating tolerances) must be extracted into pure TypeScript domain functions or use cases.
  * Data access (saving/loading records) must be handled by repository layers.
* **Open/Closed Principle (OCP):**
  * The calibration execution engine must be closed for modification but open for extension. Adding a new equipment type with completely different test metrics must be done by adding a new Template configuration, not by altering the core execution logic with `if/else` or `switch` statements.
* **Liskov Substitution Principle (LSP):**
  * Ensure that any interface defined for an equipment protocol or calibration strategy can be replaced by a concrete implementation without breaking the application.
* **Interface Segregation Principle (ISP):**
  * Keep TypeScript interfaces small and highly cohesive. Do not force components to depend on massive `Equipment` interfaces if they only need the `SerialNumber` and `Status`.
* **Dependency Inversion Principle (DIP):**
  * High-level modules (business logic) should not depend on low-level modules (SQLite/File System or UI). Both should depend on abstractions (interfaces).

## 5. Coding Standards & Clean Code
* **Naming:** Use clear, descriptive names. Avoid abbreviations. (e.g., use `calculateVoltageDeviation` instead of `calcDev`).
* **Immutability:** Prefer immutable data structures. Avoid mutating state directly in React; use functional updates.
* **Magic Numbers:** No magic numbers in the code. Extract constants (like standard voltage points) into configuration files or enums.
* **Error Handling:** Implement robust error boundaries in React and graceful error catching in the Electron Main process to prevent the app from crashing.

## 6. Development Workflow Rules for AI Agents
1. Always define TypeScript interfaces/types before writing the implementation.
2. When creating Electron features, always show the `preload.ts` updates alongside the main and renderer code.
3. Keep functions small (under 20-30 lines if possible) and focused on a single task.
4. When writing UI, ensure it is responsive and state changes are optimized to prevent unnecessary re-renders.
5. Anticipate that the data model for measurements will be deeply nested (Cycles -> Points -> Standard/Set readings) and handle state updates accordingly.