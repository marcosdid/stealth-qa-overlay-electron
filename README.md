# stealth-qa-overlay-electron

Aplicação Electron que captura a tela, roda OCR local e consulta a API de Chat Completions da OpenAI, exibindo a resposta em um overlay invisível para gravações.

## Funcionalidades
- Atalho global **Ctrl+Shift+Q** para capturar a tela atual.
- OCR local com `tesseract.js`.
- Heurística simples para extrair a pergunta da captura.
- Consulta à API da OpenAI para responder em até 4 linhas.
- Overlay sem borda, transparente, click-through e com proteção de conteúdo (não aparece em streams ou gravações).
- Fade automático após ~12 segundos.

## Requisitos
- Node.js 18+
- Windows 10 ou superior

## Como rodar
```bash
npm install
cp .env.example .env # preencha OPENAI_API_KEY
npm run dev
```

Por padrão, o OCR usa o idioma `por` (Português). Para outro idioma, defina a variável de ambiente `LANG` com o código Tesseract correspondente (por exemplo, `LANG=eng`).

## Build
```bash
npm run dist
```

## Notas de privacidade
O overlay usa `setContentProtection(true)` e foi projetado para não aparecer em capturas de tela ou gravações (testar no Teams/Zoom/OBS).

## Troubleshooting
- No primeiro uso do OCR, o tesseract pode baixar dados de linguagem (`traineddata`).
- Verifique se sua chave `OPENAI_API_KEY` está correta no `.env`.

## Critérios de aceitação (manual)
- Pressionar **Ctrl+Shift+Q** executa o fluxo e apenas o overlay aparece.
- OCR retorna texto para capturas contendo texto.
- Pergunta detectada é a última linha com `?` ou as últimas 3 linhas.
- Resposta da API não é vazia (com chave válida).
- Overlay aparece no canto superior direito, não recebe cliques e some após 12s.
- Overlay permanece invisível em gravações/streams.
- `npm run dist` gera instaladores NSIS/MSI funcionais.
