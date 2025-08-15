const Tesseract = require('tesseract.js');

async function runOCR(pngBuffer, lang = 'pt-BR') {
  const { data: { text } } = await Tesseract.recognize(pngBuffer, lang);
  return text;
}

module.exports = { runOCR };
