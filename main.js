const { app, BrowserWindow, globalShortcut, desktopCapturer, screen } = require('electron');
const path = require('path');
require('dotenv').config();
const { runOCR } = require('./src/ocr');
const { askLLM } = require('./src/llm');

let overlay, hiddenHost;

function createWindows() {
  hiddenHost = new BrowserWindow({ show: false });

  const overlayWidth = parseInt(process.env.OVERLAY_WIDTH || '480', 10);
  const overlayHeight = parseInt(process.env.OVERLAY_HEIGHT || '220', 10);

  overlay = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlay.setIgnoreMouseEvents(true, { forward: true });
  overlay.setContentProtection(true);
  overlay.loadFile(path.join(__dirname, 'public', 'overlay.html'));
}

function positionOverlay() {
  const { workArea } = screen.getPrimaryDisplay();
  const overlayWidth = overlay.getBounds().width;
  const overlayHeight = overlay.getBounds().height;
  const x = workArea.x + workArea.width - overlayWidth - 16;
  const y = workArea.y + 16;
  overlay.setBounds({ x, y, width: overlayWidth, height: overlayHeight });
}

async function pipeline() {
  try {
    positionOverlay();
    overlay.showInactive();
    overlay.webContents.send('render-answer', { text: 'Lendo tela… (OCR)' });

    const { width, height } = screen.getPrimaryDisplay().size;
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width, height } });
    const displayId = screen.getPrimaryDisplay().id.toString();
    let source = sources.find(s => s.display_id === displayId);
    if (!source) {
      source = sources.sort((a, b) => b.thumbnail.getSize().width * b.thumbnail.getSize().height - a.thumbnail.getSize().width * a.thumbnail.getSize().height)[0];
    }
    const pngBuffer = source.thumbnail.toPNG();

    const lang = process.env.LANG || 'por';
    const ocrText = await runOCR(pngBuffer, lang);

    const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
    let question = lines.filter(l => l.includes('?')).pop();
    if (!question) {
      question = lines.slice(-3).join(' ');
    }

    overlay.webContents.send('render-answer', { text: 'Consultando ChatGPT…' });
    const answer = await askLLM(question, ocrText);
    overlay.webContents.send('render-answer', { text: answer });

    setTimeout(() => {
      overlay.webContents.send('fade-out');
      setTimeout(() => overlay.hide(), 400);
    }, 12000);
  } catch (err) {
    overlay.webContents.send('render-answer', { text: `Erro: ${err.message}` });
    setTimeout(() => {
      overlay.webContents.send('fade-out');
      setTimeout(() => overlay.hide(), 400);
    }, 12000);
  }
}

app.whenReady().then(() => {
  createWindows();

  overlay.webContents.on('did-finish-load', () => {
    positionOverlay();
    overlay.showInactive();
    overlay.webContents.send('render-answer', { text: 'Pronto. Pressione Ctrl+Shift+Q para começar.' });
    setTimeout(() => {
      overlay.webContents.send('fade-out');
      setTimeout(() => overlay.hide(), 400);
    }, 3000);
  });

  globalShortcut.register('Control+Shift+Q', pipeline);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
