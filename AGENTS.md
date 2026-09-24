# Calibração LHF — Instruções do repositório

## Escopo

Este repositório contém o cliente React/Vite e o shell Electron do sistema de calibração. A API Express/MariaDB fica em `../calibracao-api` e a documentação compartilhada em `../calibracao-knowledge`.

Antes de mudanças de domínio, arquitetura ou integração, consulte `../calibracao-knowledge/HOME.md` e os documentos apontados por ele. Se a documentação e o código divergirem, trate o código como comportamento atual, registre a divergência e não invente a intenção do produto.

## Fronteiras arquiteturais

- `src/components` e `src/pages` renderizam a interface; regras metrológicas não devem ser implementadas neles.
- Estado e coordenação de tela podem ficar em hooks, mas regras de negócio devem ser funções ou serviços puros em `src/domain` ou `src/core/domain`.
- O renderer não pode importar APIs Node.js. No desktop, toda capacidade nativa passa por `electron/preload.ts` e handlers explícitos em `electron/main.ts`.
- Ao alterar uma operação IPC, atualize em conjunto o renderer, `src/global.d.ts`, o preload e o handler do processo principal.
- A integração HTTP deve ficar em `src/services`; componentes não devem montar URLs ou chamar `fetch` diretamente.
- Novos tipos de equipamento devem ser expressos por templates/configuração sempre que possível, sem condicionais por modelo no motor central.
- Preserve compatibilidade entre execução manual e futura aquisição Serial/USB por meio de contratos de entrada comuns.

## Metrologia

- Alterações em desvio, correção, tolerância, incerteza, arredondamento ou aprovação exigem teste automatizado com casos de fronteira.
- Não altere fórmulas apenas para fazer um teste passar. Registre dúvidas de negócio em `../calibracao-knowledge/domain/metrology-rules.md`.
- Valores exibidos e valores usados no cálculo devem ter políticas de arredondamento explícitas e distintas quando necessário.

## Qualidade e segurança

- Preserve `contextIsolation: true` e `nodeIntegration: false`.
- Evite `any` em contratos novos, especialmente na fronteira `window.electron`.
- Não registre tokens, senhas, assinaturas em base64 ou dados pessoais em logs.
- Não use o MariaDB do NAS em testes automatizados.
- Faça mudanças pequenas e preserve alterações não relacionadas.

## Verificação

Para alterações atuais, execute no mínimo:

- `npm run check`

O comando agrega lint, verificação de tipos, testes e build. Durante a redução da baseline, avisos conhecidos do ESLint permanecem visíveis, mas erros são bloqueantes. Relate qualquer etapa que não pôde ser executada.

## Agentes e skills

- Use agentes especializados apenas para subtarefas independentes e delimitadas.
- Revisores devem permanecer em somente leitura e apresentar evidências com arquivos e linhas.
- Escrita paralela em arquivos relacionados deve ser evitada.
- Skills em `.agents/skills` são procedimentos especializados, não substituem estas instruções permanentes.
- Skills compartilhadas de TDD, diagnóstico, domínio, revisão, documentação e descoberta são sincronizadas de `../calibracao-knowledge/skills`; não edite essas cópias manualmente.

## Documentação

Atualize o vault quando uma mudança alterar arquitetura, regra metrológica, contrato entre front/API, operação ou decisão já registrada. Decisões relevantes devem ganhar um ADR; não use o worklog como substituto de documentação permanente.
